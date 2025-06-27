import { DOMParser, XMLSerializer } from 'xmldom';
import * as fs from 'fs';

export class XmlHelper {
    static loadXml(filePath: string): Document {
        const xmlContent = fs.readFileSync(filePath, 'utf-8');
        const parser = new DOMParser();
        return parser.parseFromString(xmlContent, 'text/xml');
    }

    static saveXml(doc: Document, filePath: string): void {
        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(doc);
        fs.writeFileSync(filePath, xmlString, 'utf-8');
    }

    static getSetting(doc: Document, settingName: string): string | null {
        const setting = doc.querySelector(`setting[name="${settingName}"]`);
        return setting?.getAttribute('value') || null;
    }

    static setSetting(doc: Document, settingName: string, value: string): void {
        const setting = doc.querySelector(`setting[name="${settingName}"]`);
        if (setting) {
            setting.setAttribute('value', value);
        } else {
            const settings = doc.querySelector('settings');
            if (settings) {
                const newSetting = doc.createElement('setting');
                newSetting.setAttribute('name', settingName);
                newSetting.setAttribute('value', value);
                settings.appendChild(newSetting);
            }
        }
    }
}
