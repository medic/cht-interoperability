import nanoLib, { DocumentScope, ServerScope } from 'nano';
import { CHT } from '../../config';
import { logger } from '../../logger';

// Extract base URL (remove trailing slash to avoid double slashes)
const baseUrl = new URL(CHT.url);

// Construct the full server URL
const serverUrl = `https://${CHT.username}:${CHT.password}@${baseUrl.hostname}`;

// CouchDB database name
const databaseName = 'medic';

// Initialize types
let db: DocumentScope<any>; // Replace 'any' with a document interface if available

try {
  const nano: ServerScope = nanoLib(serverUrl);
  db = nano.use(databaseName); // ✅ Correct way to get DB
  logger.debug(`CouchDB Database connection to ${baseUrl} established successfully.`);
} catch (error) {
  logger.error('Failed to connect to the database:', error);
}

async function getPatientDocumentByDocumentSearch(phone: string) {
  try {
    const result = await db.find({
      selector: {
        type: 'person',
        phone: phone
      }      
    });
    return result.docs[0] || null;
  } catch (error) {
    logger.error('Error while searching for patient document by phone:', error);
    return null;
  }
}

export const getContactDocumentByPhone = async (phone: string) => {
  try {
    // Query by patient_id
    const patientInfo = await db.view('medic-client', 'contacts_by_phone', {
      key: phone,
      include_docs: true,
    });

    if (patientInfo?.rows?.length > 0 && patientInfo.rows[0]?.doc) {
      return patientInfo.rows[0].doc;
    }

    // There are times when the contacts by phone view is not updated yet so we need a fallback.
    // If the document is null, fallback to alternative query
    const fallbackPatient = await getPatientDocumentByDocumentSearch(phone);
    if (fallbackPatient) {
      return fallbackPatient;
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-console
    console.warn(`Error: Could not find patient with phone ${phone}: ${error.message}`);
    return null;
  }
};

async function upsertDoc(doc: Record<string, unknown>){
  try {
    return await db.insert(doc);
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.log('error while upserting doc:', error);
    return null;
  }
}

export interface PatientInfo {
  phone_number: string;
  openimis_id: string;
}

export const addOpenIMISId = async (patientInfo: PatientInfo) => {
  try {
    // Retrieve the current document by its ID
    const existingDoc = await getContactDocumentByPhone(patientInfo.phone_number);

    if (!existingDoc) {
      throw new Error(`Patient with phone ${patientInfo.phone_number} not found.`);
    }

    const updatedDoc = { ...existingDoc, openimis_id: patientInfo.openimis_id };

    // Save the updated document back to CouchDB
    return await upsertDoc(updatedDoc);
  } catch  {
    return null;
  }
};
