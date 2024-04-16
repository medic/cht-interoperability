import requests
import json
import schedule
import time
import datetime
import os

openmrs_url = os.getenv('OPENMRS_URL')
openmrs_username = os.getenv('OPENMRS_USER')
openmrs_password = os.getenv('OPENMRS_PASSWORD')

openhim_url = os.getenv('OPENHIM_URL')
openhim_username = os.getenv('OPENHIM_USER')
openhim_password = os.getenv('OPENHIM_PASSWORD')


last_updated = datetime.datetime.now(datetime.UTC).isoformat()
patients_already_sent = []
encounters_already_sent = []

def get_patient_count():
  count_url = f"{openmrs_url}?_summary=count"
  response = requests.get(count_url, auth=(openmrs_username, openmrs_password), verify=False)
  count = response.json()['total']
  return count

def fetch_and_post_by_id(patient_id):
  patient_url = f"{openmrs_url}Patient/{patient_id}"
  response = requests.get(patient_url, auth=(openmrs_username, openmrs_password))
  return post_data_to_openhim(response.json(), 'patient')

def fetch_and_post_observations(patient_id):
  patient_url = f"{openmrs_url}Observation/?subject={patient_id}"
  response = requests.get(patient_url, auth=(openmrs_username, openmrs_password))
  return post_data_to_openhim(response.json(), 'observations')

def fetch_new_patient_data():
  try:
    print('Fetching new patients')
    patient_url = f"{openmrs_url}Patient/?_lastUpdated=gt{last_updated}"
    response = requests.get(patient_url, auth=(openmrs_username, openmrs_password))
    if response.status_code == 200 and response.json()['total'] > 0:
      patients = response.json()['entry']
      for patient in patients:
        if patient['resource']['id'] not in patients_already_sent:
          print("Sending new patient")
          print(patient)
          response = post_data_to_openhim(patient['resource'], 'patient')
          if response.status_code == 200 or response.status_code == 201:
            patients_already_sent.append(patient['resource']['id'])
    else:
      print(f"Failed to fetch patient data from OpenMRS. Status code: {response.status_code}")
  except requests.exceptions.RequestException as e:
    print(f"Error fetching patient data: {e}")

def fetch_new_observations():
  print('Fetching new observations')
  try:
    encounter_url = f"{openmrs_url}Encounter/?_lastUpdated=gt{last_updated}"
    response = requests.get(encounter_url, auth=(openmrs_username, openmrs_password))
    if response.status_code == 200 and response.json()['total'] > 0:
      encounters = response.json()['entry']
      for encounter in encounters:
        if (encounter['resource']['id'] not in encounters_already_sent) and ('partOf' in encounter['resource']):
          print("Sending new encounter")
          print(encounter)
          patient_id = encounter['resource']['subject']['reference'].split('/')[-1]
          patient_url = f"{openmrs_url}Observation/?subject={patient_id}"
          response = requests.get(patient_url, auth=(openmrs_username, openmrs_password))
          if response.status_code == 200:
            response = post_data_to_openhim(response.json(), 'observations')
            if response.status_code == 200 or response.status_code == 201:
              encounters_already_sent.append(encounter['resource']['id'])
    else:
      print(f"Failed to fetch patient data from OpenMRS. Status code: {response.status_code}")
  except requests.exceptions.RequestException as e:
    print(f"Error fetching patient data: {e}")

def post_data_to_openhim(data, suffix):
  response = requests.post(
      f"{openhim_url}/{suffix}",
      json=data,
      auth=(openhim_username, openhim_password),
      verify=False,
      headers={'Content-Type': 'application/json'}
  )
  if response.status_code == 201:
    print("Patient data posted to OpenHIM successfully.")
  else:
    print(f"Failed to post patient data to OpenHIM. Status code: {response.status_code}")
    print(response.text)
  return response

schedule.every(1).minutes.do(fetch_new_patient_data)
schedule.every(1).minutes.do(fetch_new_observations)

while True:
  schedule.run_pending()
  time.sleep(1)
