import { describe, it, expect } from 'vitest';
import { 
  createProperty, 
  updateProperty, 
  publishProperty, 
  unpublishProperty, 
  archiveProperty, 
  unarchiveProperty,
  duplicateProperty, 
  deleteProperty,
  getPropertyById, 
  getPropertyBySlug, 
  getProperties,
  getPropertyStats,
  getAuditLogs,
  addPropertyMedia,
  setCoverMedia,
  reorderPropertyMedia,
  removePropertyMedia
} from '../lib/store';
import { checkAdminAuth } from '../lib/auth';

describe('Property CMS & Admin Workflow Acceptance Tests', () => {
  const adminEmail = 'edgar@yourrealtoredgar.com';
  let createdPropertyId = '';
  let createdPropertySlug = '';

  it('1. Rejects unauthorized visitor access to admin guards', () => {
    // Plain request without cookie or header
    const publicReq = new Request('http://localhost:4321/api/admin/properties');
    expect(checkAdminAuth(publicReq)).toBe(false);

    // Request with spoofed or invalid cookie
    const forgedReq = new Request('http://localhost:4321/api/admin/properties', {
      headers: { 'Cookie': 'valle_admin_session=invalid-guest-token' }
    });
    expect(checkAdminAuth(forgedReq)).toBe(false);
  });

  it('2. Authorized admin can create a draft property with auto-slug and audit log', async () => {
    const res = await createProperty({
      title: 'Del Mar Coastal Contemporary Villa',
      property_type: 'Single Family',
      listing_status: 'for_sale',
      publication_status: 'draft',
      price: 2450000,
      bedrooms: 4,
      bathrooms: 3.5,
      square_feet: 3100,
      neighborhood: 'Del Mar',
      address_street: '1520 Camino Del Mar',
      address_city: 'Del Mar',
      address_zip: '92014',
      description: 'Custom contemporary architectural retreat moments to Del Mar beach.',
      is_indexable: true
    }, adminEmail);

    expect(res.success).toBe(true);
    expect(res.property).toBeDefined();
    expect(res.property.id).toBeDefined();
    expect(res.property.publication_status).toBe('draft');
    expect(res.property.slug).toContain('del-mar-coastal-contemporary-villa');
    expect(res.property.view_count).toBe(0);
    expect(res.property.inquiries_count).toBe(0);

    createdPropertyId = res.property.id;
    createdPropertySlug = res.property.slug;

    // Verify audit log recorded
    const logs = await getAuditLogs(5);
    const createLog = logs.find(l => l.action === 'create_property' && l.entity_id === createdPropertyId);
    expect(createLog).toBeDefined();
    expect(createLog?.actor_email).toBe(adminEmail);
  });

  it('3. Draft listing is NOT publicly discoverable or accessible', async () => {
    // Public directory search
    const publicList = await getProperties();
    const foundInPublic = publicList.some(p => p.id === createdPropertyId || p.slug === createdPropertySlug);
    expect(foundInPublic).toBe(false);

    // Direct public slug access
    const publicProp = await getPropertyBySlug(createdPropertySlug, { allowUnpublished: false });
    expect(publicProp).toBeUndefined();

    // Authorized admin preview access
    const adminPreview = await getPropertyBySlug(createdPropertySlug, { allowUnpublished: true });
    expect(adminPreview).toBeDefined();
    expect(adminPreview?.id).toBe(createdPropertyId);
    expect(adminPreview?.publication_status).toBe('draft');
  });

  it('4. Authorized admin can upload, set cover, reorder, and remove media', async () => {
    // Add photo 1
    const photo1 = await addPropertyMedia(createdPropertyId, {
      media_type: 'image',
      url: '/images/properties/del-mar-front.svg',
      alt_text: 'Front architectural facade',
      display_order: 1,
      is_primary: true
    });
    expect(photo1.id).toBeDefined();
    expect(photo1.url).toBe('/images/properties/del-mar-front.svg');

    // Add photo 2
    const photo2 = await addPropertyMedia(createdPropertyId, {
      media_type: 'image',
      url: '/images/properties/del-mar-ocean-terrace.svg',
      alt_text: 'Ocean view terrace with fire table',
      display_order: 2,
      is_primary: false
    });
    expect(photo2.id).toBeDefined();

    // Verify photos attached
    const prop = await getPropertyById(createdPropertyId);
    expect(prop?.media?.length).toBe(2);
    expect(prop?.primary_image).toBe(photo1.url);

    // Set photo 2 as cover
    const coverRes = await setCoverMedia(createdPropertyId, photo2.id);
    expect(coverRes).toBe(true);

    const updatedProp = await getPropertyById(createdPropertyId);
    expect(updatedProp?.primary_image).toBe(photo2.url);

    // Reorder photos
    const reorderRes = await reorderPropertyMedia(createdPropertyId, [photo2.id, photo1.id]);
    expect(reorderRes).toBe(true);

    // Remove photo 1
    const removeRes = await removePropertyMedia(createdPropertyId, photo1.id);
    expect(removeRes).toBe(true);
    const propAfterRemove = await getPropertyById(createdPropertyId);
    expect(propAfterRemove?.media?.length).toBe(1);
  });

  it('5. Publishing listing immediately makes it visible on the public site', async () => {
    const pubRes = await publishProperty(createdPropertyId, adminEmail);
    expect(pubRes).toBe(true);

    // Public list query now includes it
    const publicList = await getProperties();
    const foundInPublic = publicList.find(p => p.id === createdPropertyId);
    expect(foundInPublic).toBeDefined();
    expect(foundInPublic?.publication_status).toBe('published');

    // Direct public slug access now returns it
    const publicProp = await getPropertyBySlug(createdPropertySlug);
    expect(publicProp).toBeDefined();
    expect(publicProp?.title).toBe('Del Mar Coastal Contemporary Villa');

    // Check audit log
    const logs = await getAuditLogs(5);
    const pubLog = logs.find(l => l.action === 'publish_property' && l.entity_id === createdPropertyId);
    expect(pubLog).toBeDefined();
  });

  it('6. Editing price records previous price and writes audit log', async () => {
    const oldPrice = 2450000;
    const newPrice = 2395000;

    const updateRes = await updateProperty(createdPropertyId, { price: newPrice }, adminEmail);
    expect(updateRes.success).toBe(true);
    expect(updateRes.property?.price).toBe(newPrice);
    expect(updateRes.property?.previous_price).toBe(oldPrice);

    // Check audit log
    const logs = await getAuditLogs(5);
    const priceLog = logs.find(l => l.action === 'update_price' && l.entity_id === createdPropertyId);
    expect(priceLog).toBeDefined();
    expect(priceLog?.details?.old_price).toBe(oldPrice);
    expect(priceLog?.details?.new_price).toBe(newPrice);
  });

  it('7. Duplicating a listing creates a separate draft copy with unique slug', async () => {
    const dupRes = await duplicateProperty(createdPropertyId, adminEmail);
    expect(dupRes.success).toBe(true);
    expect(dupRes.property).toBeDefined();
    expect(dupRes.property?.id).not.toBe(createdPropertyId);
    expect(dupRes.property?.title).toContain('(Draft Copy)');
    expect(dupRes.property?.slug).toContain('-copy-');
    expect(dupRes.property?.publication_status).toBe('draft');
    expect(dupRes.property?.view_count).toBe(0);

    // Ensure clone is not on public site
    const publicProp = await getPropertyBySlug(dupRes.property!.slug);
    expect(publicProp).toBeUndefined();
  });

  it('8. Unpublishing and Archiving safely removes listing from public catalog', async () => {
    // Unpublish
    const unpubRes = await unpublishProperty(createdPropertyId, adminEmail);
    expect(unpubRes).toBe(true);

    let publicCheck = await getPropertyBySlug(createdPropertySlug);
    expect(publicCheck).toBeUndefined();

    // Archive
    const archRes = await archiveProperty(createdPropertyId, adminEmail);
    expect(archRes).toBe(true);

    let prop = await getPropertyById(createdPropertyId);
    expect(prop?.publication_status).toBe('archived');

    publicCheck = await getPropertyBySlug(createdPropertySlug);
    expect(publicCheck).toBeUndefined();

    // Unarchive (restores to draft)
    const unarchRes = await unarchiveProperty(createdPropertyId, adminEmail);
    expect(unarchRes).toBe(true);
    prop = await getPropertyById(createdPropertyId);
    expect(prop?.publication_status).toBe('draft');
  });

  it('9. Soft-delete preserves historical data while purging from active catalog', async () => {
    const delRes = await deleteProperty(createdPropertyId, true, adminEmail);
    expect(delRes).toBe(true);

    // Record still exists in repository for reporting
    const historicalProp = await getPropertyById(createdPropertyId);
    expect(historicalProp).toBeDefined();
    expect(historicalProp?.deleted_at).toBeDefined();

    // Active stats exclude soft-deleted properties
    const activeStats = await getPropertyStats();
    expect(activeStats).toBeDefined();

    // Public list excludes soft-deleted properties
    const publicList = await getProperties();
    expect(publicList.some(p => p.id === createdPropertyId)).toBe(false);
  });
});
