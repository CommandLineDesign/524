import { Datagrid, DateField, List, Pagination, TextField } from 'react-admin';

const PendingArtistsList = () => (
  <List
    perPage={25}
    sort={{ field: 'signupDate', order: 'DESC' }}
    pagination={<Pagination rowsPerPageOptions={[25, 50]} />}
    title="Pending Artists"
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="name" label="Name" />
      <TextField source="stageName" label="Stage Name" />
      <TextField source="email" label="Email" />
      <TextField source="phoneNumber" label="Phone" />
      <DateField source="signupDate" label="Signup Date" showTime />
      <TextField source="verificationStatus" label="Status" />
    </Datagrid>
  </List>
);

export default PendingArtistsList;
