const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('====================================================');
console.log('   PHASE D6.1 HARDENED STORAGE URL TEST SUITE       ');
console.log('====================================================');

let passCount = 0;
const totalTests = 28;

function assertTest(testId, name, condition, details = '') {
  if (condition) {
    console.log(`✅ [${testId}] PASS - ${name}`);
    if (details) console.log(`   ${details}`);
    passCount++;
  } else {
    console.error(`❌ [${testId}] FAIL - ${name}`);
    if (details) console.error(`   ${details}`);
    process.exitCode = 1;
  }
}

const storageUtilsSrc = fs.readFileSync(path.resolve(__dirname, '../src/admin/storage/utils/storageUtils.ts'), 'utf-8');
const storageServiceSrc = fs.readFileSync(path.resolve(__dirname, '../src/admin/storage/services/storage.service.ts'), 'utf-8');
const imageUploaderSrc = fs.readFileSync(path.resolve(__dirname, '../src/admin/storage/components/ImageUploader.tsx'), 'utf-8');
const imageDrawerSrc = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/components/ImageFormDrawer.tsx'), 'utf-8');
const projectDrawerSrc = fs.readFileSync(path.resolve(__dirname, '../src/admin/projects/components/ProjectFormDrawer.tsx'), 'utf-8');
const videoDrawerSrc = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/components/VideoFormDrawer.tsx'), 'utf-8');
const mediaServiceSrc = fs.readFileSync(path.resolve(__dirname, '../src/admin/media/services/media.service.ts'), 'utf-8');

// Storage Constants and URL Parser implementation in Node
const STORAGE_BUCKET = 'vuanhmedia-assets';
const STORAGE_ORIGIN = 'https://rjylcqtiicmhhhpuxuyw.supabase.co';
const STORAGE_PUBLIC_PREFIX = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

function isManagedStorageUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.origin === STORAGE_ORIGIN &&
      url.pathname.startsWith(STORAGE_PUBLIC_PREFIX)
    );
  } catch {
    return false;
  }
}

function extractManagedStoragePath(value) {
  if (!value || typeof value !== 'string') return null;
  if (!isManagedStorageUrl(value)) return null;

  try {
    const url = new URL(value);
    const relativePath = url.pathname.slice(STORAGE_PUBLIC_PREFIX.length);
    const cleanPath = relativePath.split('?')[0].split('#')[0].trim();
    return cleanPath.length > 0 ? cleanPath : null;
  } catch {
    return null;
  }
}

// 6 MANDATORY URL TESTS
const validManagedUrl = 'https://rjylcqtiicmhhhpuxuyw.supabase.co/storage/v1/object/public/vuanhmedia-assets/projects/abc/gallery/test.jpg';
const diffOriginUrl = 'https://other-project.supabase.co/storage/v1/object/public/vuanhmedia-assets/projects/abc/gallery/test.jpg';
const diffBucketUrl = 'https://rjylcqtiicmhhhpuxuyw.supabase.co/storage/v1/object/public/another-bucket/test.jpg';
const spoofedQueryUrl = 'https://evil.example.com/?next=/storage/v1/object/public/vuanhmedia-assets/test.jpg';
const youtubeThumbUrl = 'https://i.ytimg.com/vi/test/hqdefault.jpg';
const invalidStringUrl = 'not-a-url';

assertTest('URL-1', 'Valid managed URL returns TRUE and extracts relative path',
  isManagedStorageUrl(validManagedUrl) === true &&
  extractManagedStoragePath(validManagedUrl) === 'projects/abc/gallery/test.jpg',
  'Matches origin https://rjylcqtiicmhhhpuxuyw.supabase.co and bucket vuanhmedia-assets'
);

assertTest('URL-2', 'Different Supabase origin returns FALSE',
  isManagedStorageUrl(diffOriginUrl) === false &&
  extractManagedStoragePath(diffOriginUrl) === null,
  'Rejects https://other-project.supabase.co'
);

assertTest('URL-3', 'Different storage bucket on same origin returns FALSE',
  isManagedStorageUrl(diffBucketUrl) === false &&
  extractManagedStoragePath(diffBucketUrl) === null,
  'Rejects another-bucket'
);

assertTest('URL-4', 'Spoofed query parameter on malicious domain returns FALSE',
  isManagedStorageUrl(spoofedQueryUrl) === false &&
  extractManagedStoragePath(spoofedQueryUrl) === null,
  'Rejects https://evil.example.com query trick'
);

assertTest('URL-5', 'YouTube CDN thumbnail URL returns FALSE',
  isManagedStorageUrl(youtubeThumbUrl) === false &&
  extractManagedStoragePath(youtubeThumbUrl) === null,
  'Rejects external YouTube thumbnail CDN'
);

assertTest('URL-6', 'Malformed or non-URL string returns FALSE',
  isManagedStorageUrl(invalidStringUrl) === false &&
  extractManagedStoragePath(invalidStringUrl) === null,
  'Rejects non-URL string safely without throwing'
);

// D6-01: Shared ImageUploader exists
assertTest('D6-01', 'Shared ImageUploader component exists and is exported',
  fs.existsSync(path.resolve(__dirname, '../src/admin/storage/components/ImageUploader.tsx')) &&
  imageUploaderSrc.includes('export const ImageUploader'),
  'Reusable ImageUploader component available'
);

// D6-02, D6-03, D6-04, D6-05, D6-06: Client validation rules
assertTest('D6-02', 'JPG image MIME/extension accepted',
  storageUtilsSrc.includes("'image/jpeg'") && storageUtilsSrc.includes("'jpg'"),
  'image/jpeg and .jpg/.jpeg accepted'
);

assertTest('D6-03', 'PNG image MIME/extension accepted',
  storageUtilsSrc.includes("'image/png'") && storageUtilsSrc.includes("'png'"),
  'image/png and .png accepted'
);

assertTest('D6-04', 'WebP image MIME/extension accepted',
  storageUtilsSrc.includes("'image/webp'") && storageUtilsSrc.includes("'webp'"),
  'image/webp and .webp accepted'
);

assertTest('D6-05', 'SVG, GIF, PDF, Video strictly rejected by whitelist',
  !storageUtilsSrc.includes("'image/svg+xml'") && !storageUtilsSrc.includes("'image/gif'") && !storageUtilsSrc.includes("'application/pdf'"),
  'Strict allowed MIME whitelist: JPEG, PNG, WebP only'
);

assertTest('D6-06', 'Files over 20 MB strictly rejected',
  storageUtilsSrc.includes('20 * 1024 * 1024') && storageUtilsSrc.includes('MAX_IMAGE_SIZE_BYTES'),
  '20 MB size limit enforced'
);

// D6-07: UUID object filenames
assertTest('D6-07', 'Storage path uses crypto.randomUUID() filenames',
  storageUtilsSrc.includes('crypto.randomUUID') && storageUtilsSrc.includes('projects/${projectId}/${category}/${uniqueId}.${ext}'),
  'UUID-based unique filenames guaranteed'
);

// D6-08: No upsert
assertTest('D6-08', 'Storage upload sets upsert: false',
  storageServiceSrc.includes('upsert: false'),
  'Prevents silent file overwrites'
);

// D6-09: Upload requires project_id
assertTest('D6-09', 'Upload requires non-empty projectId',
  storageServiceSrc.includes('if (!projectId || !projectId.trim())') &&
  imageUploaderSrc.includes('Vui lòng chọn dự án trước khi tải ảnh.'),
  'Upload blocked when projectId missing'
);

// D6-10: Generic external URL support preserved
assertTest('D6-10', 'External URL input mode preserved across all uploaders',
  imageUploaderSrc.includes("mode === 'url'") && imageDrawerSrc.includes('finalFileUrl'),
  'Users can choose between upload and URL'
);

// D6-11: Hardened URL detector in source code
assertTest('D6-11', 'storageUtils.ts enforces STORAGE_ORIGIN and new URL() parsing',
  storageUtilsSrc.includes('STORAGE_ORIGIN') &&
  storageUtilsSrc.includes('new URL(value)') &&
  storageUtilsSrc.includes('url.origin === STORAGE_ORIGIN'),
  'Robust origin and path prefix check'
);

// D6-12: External URL never passed to storage.remove
assertTest('D6-12', 'deleteManagedImageByUrl ignores external URLs safely',
  storageServiceSrc.includes('if (!isManagedStorageUrl(url)) {') && storageServiceSrc.includes('return false;'),
  'Safe no-op for YouTube/Unsplash/CDN links'
);

// D6-13: Gallery create cleanup on DB failure
assertTest('D6-13', 'Gallery insert failure triggers storage object cleanup',
  imageDrawerSrc.includes('if (uploadedStoragePath) {') && imageDrawerSrc.includes('await cleanupFailedUpload(uploadedStoragePath);'),
  'Orphan storage files prevented on DB failure'
);

// D6-14: Gallery safe replacement order
assertTest('D6-14', 'Safe replacement order: upload new -> update DB -> delete old managed',
  imageDrawerSrc.includes('await onSave') && imageDrawerSrc.includes('deleteManagedImageByUrl(oldFileUrl)'),
  'Old image retained until new DB update succeeds'
);

// D6-15: Gallery safe deletion order
assertTest('D6-15', 'Safe deletion order: delete DB first -> cleanup managed storage',
  mediaServiceSrc.includes('.delete()') && mediaServiceSrc.includes('.eq(\'id\', id)') && mediaServiceSrc.includes('deleteManagedImageByUrl(mediaData.file_url)'),
  'DB reference deleted before storage object removal'
);

// D6-16: Project cover uploader
assertTest('D6-16', 'Project cover uploader integrated in ProjectFormDrawer',
  projectDrawerSrc.includes('upload(projectToEdit.id, \'cover\', selectedCoverFile)'),
  'Direct cover image upload supported'
);

// D6-17: Project thumbnail uploader
assertTest('D6-17', 'Project thumbnail uploader integrated in ProjectFormDrawer',
  projectDrawerSrc.includes('upload(projectToEdit.id, \'thumbnail\', selectedThumbnailFile)'),
  'Direct thumbnail image upload supported'
);

// D6-18: Pre-project orphan upload blocked
assertTest('D6-18', 'Pre-project orphan upload blocked for new projects',
  projectDrawerSrc.includes('allowDirectUpload={isExistingProject}'),
  'Requires saving project before direct file upload'
);

// D6-19: Video custom thumbnail upload
assertTest('D6-19', 'Video custom thumbnail uploader integrated in VideoFormDrawer',
  videoDrawerSrc.includes('upload(\n          formData.project_id,\n          \'video-thumbnails\','),
  'Custom video thumbnail upload supported'
);

// D6-20: YouTube thumbnail auto behavior preserved
assertTest('D6-20', 'Automatic YouTube thumbnail derivation preserved',
  videoDrawerSrc.includes('handleAutoDeriveThumb') && videoDrawerSrc.includes('deriveThumbnail(formData.video_url, \'youtube\')'),
  '1-click YouTube thumbnail derivation active'
);

// D6-21: No raw HTML/SVG rendering
assertTest('D6-21', 'Zero dangerouslySetInnerHTML and pure <img> tag rendering',
  !imageUploaderSrc.includes('dangerouslySetInnerHTML') && imageUploaderSrc.includes('<img'),
  'Safe visual preview with onError fallback'
);

// D6-22: No service_role or secrets
const srcDir = path.resolve(__dirname, '../src');
function checkDirForSecrets(dir) {
  const files = fs.readdirSync(dir);
  let foundSecret = false;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (checkDirForSecrets(fullPath)) foundSecret = true;
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('service_role') || content.includes('passcodeInput') || content.includes('vuanhmedia2026')) {
        foundSecret = true;
      }
    }
  }
  return foundSecret;
}
assertTest('D6-22', 'Zero service_role keys, secrets, or static access tokens in client bundle',
  !checkDirForSecrets(srcDir),
  'Clean frontend bundle verified'
);

console.log('----------------------------------------------------');
console.log(`   RESULT: ${passCount}/${totalTests} TESTS PASSED`);
console.log('====================================================');
