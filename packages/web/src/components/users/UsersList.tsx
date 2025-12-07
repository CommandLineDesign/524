import {
  BooleanField,
  Datagrid,
  DateField,
  FilterButton,
  FunctionField,
  List,
  Pagination,
  SearchInput,
  SelectInput,
  TextField,
  TopToolbar,
} from 'react-admin';

const EmptyUsers = () => (
  <div style={{ padding: 24 }}>
    <h3 style={{ margin: 0 }}>No users found</h3>
    <p style={{ marginTop: 8, color: '#555' }}>Try adjusting your filters or search query.</p>
  </div>
);

const UserFilters = [
  <SelectInput
    key="role"
    source="role"
    choices={[
      { id: 'customer', name: 'Customer' },
      { id: 'artist', name: 'Artist' },
      { id: 'admin', name: 'Admin' },
    ]}
    alwaysOn={false}
  />,
  <SearchInput key="search" source="q" alwaysOn placeholder="Search by name, email, or phone" />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton filters={UserFilters} />
  </TopToolbar>
);

const UsersList = () => (
  <List
    perPage={25}
    sort={{ field: 'createdAt', order: 'DESC' }}
    pagination={<Pagination rowsPerPageOptions={[25, 50, 100]} />}
    title="Users"
    empty={<EmptyUsers />}
    emptyWhileLoading
    filters={UserFilters}
    actions={<ListActions />}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="name" label="Name" sortable />
      <TextField source="email" label="Email" sortable={false} />
      <TextField source="phoneNumber" label="Phone" sortable={false} />
      <BooleanField source="phoneVerified" label="Phone Verified" sortable={false} />
      <FunctionField
        label="Roles"
        render={(record) => (Array.isArray(record.roles) ? record.roles.join(', ') : '')}
        sortable={false}
      />
      <BooleanField source="isActive" label="Active" sortable={false} />
      <BooleanField source="isVerified" label="Verified" sortable={false} />
      <DateField source="createdAt" label="Created" showTime sortBy="createdAt" />
    </Datagrid>
  </List>
);

export default UsersList;
