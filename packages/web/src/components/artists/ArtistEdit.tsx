import { BooleanInput, Edit, SelectInput, SimpleForm, TextInput, useNotify } from 'react-admin';

const verificationStatusChoices = [
  { id: 'pending_review', name: 'Pending Review' },
  { id: 'in_review', name: 'In Review' },
  { id: 'verified', name: 'Verified' },
  { id: 'rejected', name: 'Rejected' },
  { id: 'suspended', name: 'Suspended' },
];

const ArtistEdit = () => {
  const notify = useNotify();

  const onSuccess = () => {
    notify('Artist updated successfully', { type: 'success' });
  };

  return (
    <Edit title="Edit Artist" mutationOptions={{ onSuccess }} mutationMode="pessimistic">
      <SimpleForm>
        <TextInput source="id" label="Artist ID" disabled fullWidth />
        <TextInput source="userId" label="User ID" disabled fullWidth />
        <TextInput source="stageName" label="Stage Name" disabled fullWidth />
        <TextInput source="name" label="Real Name" disabled fullWidth />
        <TextInput source="email" label="Email" disabled fullWidth />
        <TextInput source="phoneNumber" label="Phone Number" disabled fullWidth />

        <SelectInput
          source="verificationStatus"
          label="Verification Status"
          choices={verificationStatusChoices}
          fullWidth
        />

        <BooleanInput source="isAcceptingBookings" label="Accepting Bookings" />

        <TextInput
          source="reviewNotes"
          label="Admin Review Notes"
          multiline
          minRows={3}
          fullWidth
          helperText="Internal notes about this artist (only visible to admins)"
        />
      </SimpleForm>
    </Edit>
  );
};

export default ArtistEdit;
