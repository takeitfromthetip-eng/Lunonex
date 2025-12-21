/* eslint-disable */
import { launchEditor } from './tools/imageEditor';
import { applyTransparency, exportLegacy } from './tools/imageUtils';

export async function deployPhotoEditor() {
  await launchEditor({
    modes: ['retouch', 'backgroundRemoval', 'smartPlacement'],
    moderation: 'council-reviewed',
    export: exportLegacy({ format: 'png', metadata: true }),
    access: 'sealed',
  });
}
