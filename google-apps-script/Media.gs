/**
 * Media.gs
 * Cake customizer lets customers upload a reference photo or a photo to
 * print on the cake. There's no S3/Cloudinary here — Drive IS the file
 * store. We create one folder on first use, drop uploads in it, set
 * link-sharing to viewable, and hand back a direct URL the rest of the
 * app just treats as a normal image URL.
 */

const UPLOAD_FOLDER_NAME = 'Patisserie Noir — Customer Uploads';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB safety cap

function getOrCreateUploadFolder_() {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty('UPLOAD_FOLDER_ID');
  if (existingId) {
    try { return DriveApp.getFolderById(existingId); } catch (e) { /* fall through and recreate */ }
  }
  const folders = DriveApp.getFoldersByName(UPLOAD_FOLDER_NAME);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(UPLOAD_FOLDER_NAME);
  props.setProperty('UPLOAD_FOLDER_ID', folder.getId());
  return folder;
}

/**
 * payload: { base64Data, mimeType, fileName, purpose } — no auth required;
 * this is called from the public customizer before an order exists.
 * Rate-limited loosely by file size only; for a small bakery's traffic
 * this is plenty — add a captcha upstream if this is ever abused.
 */
function uploadImage_(payload) {
  if (!payload.base64Data || !payload.mimeType) return fail_('No file data received.');
  if (!/^image\//.test(payload.mimeType)) return fail_('Only image files are allowed.');

  const approxBytes = payload.base64Data.length * 0.75;
  if (approxBytes > MAX_UPLOAD_BYTES) return fail_('Image is too large (max 5MB). Please compress it and try again.');

  try {
    const folder = getOrCreateUploadFolder_();
    const decoded = Utilities.base64Decode(payload.base64Data);
    const blob = Utilities.newBlob(decoded, payload.mimeType, payload.fileName || ('upload-' + Date.now()));
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // A direct-view URL that works as an <img src> without an extra click-through.
    const directUrl = 'https://lh3.googleusercontent.com/d/' + file.getId();

    return ok_({ url: directUrl, fileId: file.getId(), purpose: payload.purpose || 'general' });
  } catch (err) {
    return fail_('Upload failed: ' + err.message);
  }
}
