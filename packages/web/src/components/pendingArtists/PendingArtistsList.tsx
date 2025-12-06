import { Datagrid, DateField, List, Pagination, TextField } from 'react-admin';

const EmptyPendingArtists = () => (
  <div style={{ padding: 24 }}>
    <h3 style={{ margin: 0 }}>No pending artists</h3>
    <p style={{ marginTop: 8, color: '#555' }}>New signups will appear here automatically.</p>
  </div>
);

const PendingArtistsList = () => (
  <List
    perPage={25}
    sort={{ field: 'signupDate', order: 'DESC' }}
    pagination={<Pagination rowsPerPageOptions={[25, 50]} />}
    title="Pending Artists"
    empty={<EmptyPendingArtists />}
    emptyWhileLoading
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="name" label="Name" sortable={false} />
      <TextField source="stageName" label="Stage Name" sortable={false} />
      <TextField source="email" label="Email" sortable={false} />
      <TextField source="phoneNumber" label="Phone" sortable={false} />
      <DateField source="signupDate" label="Signup Date" showTime sortBy="signupDate" />
      <TextField source="verificationStatus" label="Status" sortable={false} />
    </Datagrid>
  </List>
);

export default PendingArtistsList;
