import { randomUUID } from 'crypto';
import { Factory } from 'rosie';

const PlaceFactory = Factory.define('place')
  .option('placeId', randomUUID())
  .attr('name', "CHP Branch One")
  .attr('type', "district_hospital")
  .attr('parent', ['placeId'], function (placeId) {
    return placeId;
  });

const ContactFactory = Factory.define('contact')
  .attr('name', "Maria Blob")
  .attr('phone', "+2868917046");

export const UserFactory = Factory.define('user')
  .option('placeId')
  .attr('password', 'Dakar1234')
  .attr('username', 'maria')
  .attr('type', 'chw')
  .attr('place', ['placeId'], function (placeId) {
    return PlaceFactory.build({}, { placeId });
  })
  .attr('contact', function () {
    return ContactFactory.build();
  });

export const PatientFactory = Factory.define('patient')
  .option('placeId')
  .attr('name', 'John Test')
  .attr('phone', '+2548277217095')
  .attr('date_of_birth', '1980-06-06')
  .attr('sex', 'male')
  .attr('type', 'person')
  .attr('role', 'patient')
  .attr('contact_type', 'patient')
  .attr('place', ['placeId'], function (placeId) {
    return placeId;
  });

const DocsFieldsFactory = Factory.define('fields')
  .option('patientId')
  .option('placeId')
  .attr('inputs', ['patientId'], function (patientId) {
    return {
      "source": "task",
      "is_covid_vaccine_referral": "",
      "contact": { "_id": patientId }
    };
  })
  .attr('vaccination_details', { "interop_follow_up": "yes" })
  .attr('meta', { "instanceID": "uuid:0fbe39f1-8aa5-477a-89ea-863831766766" })
  .attr('contact_type', '1patient')
  .attr('place', ['placeId'], function (placeId) {
    return placeId;
  });

const DocsFactory = Factory.define('docs')
  .option('placeId')
  .option('contactId')
  .option('patientId')
  .attr('form', "interop_follow_up")
  .attr('type', "data_record")
  .attr('contact', ['placeId', 'contactId'], function (placeId, contactId) {
    return ContactFactory.attr('_id', contactId).attr('parent', { '_id': placeId }).build();
  })
  .attr('from', "")
  .attr('hidden_fields', ["meta"])
  .attr('fields', ['patientId', 'placeId'], function (patientId, placeId) {
    return DocsFieldsFactory.build({}, { patientId, placeId });
  })
  .attr('_id', "{{$guid}}")
  .attr('_rev', "1-{{$guid}}");

export const TaskReportFactory = Factory.define('report')
  .option('placeId')
  .option('contactId')
  .option('patientId')
  .attr('docs', ['placeId', 'contactId', 'patientId'], function (placeId, contactId, patientId) {
    return [DocsFactory.build({}, { placeId, contactId, patientId })];
  })
  .attr('new_edits', false);
