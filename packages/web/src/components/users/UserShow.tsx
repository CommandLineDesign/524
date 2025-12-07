import {
  BooleanField,
  DateField,
  EmailField,
  FunctionField,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

const UserShow = () => (
  <Show title="User Details">
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Name" />
      <EmailField source="email" label="Email" />
      <TextField source="phoneNumber" label="Phone Number" />
      <BooleanField source="phoneVerified" label="Phone Verified" />
      <FunctionField
        label="Roles"
        render={(record) => (Array.isArray(record.roles) ? record.roles.join(', ') : '')}
      />
      <BooleanField source="isActive" label="Active" />
      <BooleanField source="isVerified" label="Verified" />
      <DateField source="createdAt" label="Created At" showTime />
      <DateField source="updatedAt" label="Updated At" showTime />
    </SimpleShowLayout>
  </Show>
);

export default UserShow;
