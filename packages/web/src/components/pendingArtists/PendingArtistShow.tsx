import {
  ArrayField,
  ChipField,
  DateField,
  Show,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
} from 'react-admin';

const PendingArtistShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" label="Name" />
      <TextField source="stageName" label="Stage Name" />
      <TextField source="email" label="Email" />
      <TextField source="phoneNumber" label="Phone" />
      <DateField source="signupDate" label="Signup Date" showTime />
      <TextField source="verificationStatus" label="Status" />
      <TextField source="bio" label="Bio" />
      <ArrayField source="specialties" label="Specialties" emptyText="No specialties listed">
        <SingleFieldList>
          <ChipField source="" />
        </SingleFieldList>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default PendingArtistShow;
