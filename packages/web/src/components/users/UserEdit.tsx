import { BooleanInput, Edit, SimpleForm, TextInput, required, useNotify } from 'react-admin';

const UserEdit = () => {
  const notify = useNotify();

  const onSuccess = () => {
    notify('User updated successfully', { type: 'success' });
  };

  return (
    <Edit title="Edit User" mutationOptions={{ onSuccess }}>
      <SimpleForm>
        <TextInput source="id" label="ID" disabled fullWidth />
        <TextInput source="name" label="Name" validate={required()} fullWidth />
        <TextInput source="email" label="Email" type="email" fullWidth />
        <TextInput source="phoneNumber" label="Phone Number" fullWidth />
        <BooleanInput source="phoneVerified" label="Phone Verified" disabled />
        <TextInput
          source="roles"
          label="Roles"
          disabled
          fullWidth
          format={(value) => (Array.isArray(value) ? value.join(', ') : (value ?? ''))}
        />
        <BooleanInput source="isActive" label="Active" />
        <BooleanInput source="isVerified" label="Verified" />
      </SimpleForm>
    </Edit>
  );
};

export default UserEdit;
