import {
  BooleanField,
  Datagrid,
  DateField,
  FilterButton,
  FunctionField,
  List,
  NumberField,
  Pagination,
  SearchInput,
  SelectInput,
  TextField,
  TopToolbar,
} from 'react-admin';

const EmptyArtists = () => (
  <div style={{ padding: 24 }}>
    <h3 style={{ margin: 0 }}>No artists found</h3>
    <p style={{ marginTop: 8, color: '#555' }}>Try adjusting your filters or search query.</p>
  </div>
);

const ArtistFilters = [
  <SearchInput key="search" source="q" alwaysOn placeholder="Search by name, email, or phone" />,
  <SelectInput
    key="verificationStatus"
    source="verificationStatus"
    choices={[
      { id: 'pending_review', name: 'Pending Review' },
      { id: 'in_review', name: 'In Review' },
      { id: 'verified', name: 'Verified' },
      { id: 'rejected', name: 'Rejected' },
      { id: 'suspended', name: 'Suspended' },
    ]}
    alwaysOn={false}
  />,
  <SelectInput
    key="isAcceptingBookings"
    source="isAcceptingBookings"
    choices={[
      { id: 'true', name: 'Accepting Bookings' },
      { id: 'false', name: 'Not Accepting' },
    ]}
    alwaysOn={false}
  />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton filters={ArtistFilters} />
  </TopToolbar>
);

const VerificationStatusField = () => (
  <FunctionField
    label="Status"
    render={(record) => {
      const status = record?.verificationStatus;
      const colors: Record<string, string> = {
        pending_review: '#f59e0b',
        in_review: '#3b82f6',
        verified: '#10b981',
        rejected: '#ef4444',
        suspended: '#6b7280',
      };
      const labels: Record<string, string> = {
        pending_review: 'Pending',
        in_review: 'In Review',
        verified: 'Verified',
        rejected: 'Rejected',
        suspended: 'Suspended',
      };
      return (
        <span
          style={{
            color: colors[status] ?? '#6b7280',
            fontWeight: 500,
          }}
        >
          {labels[status] ?? status}
        </span>
      );
    }}
  />
);

const ArtistsList = () => (
  <List
    perPage={25}
    sort={{ field: 'createdAt', order: 'DESC' }}
    pagination={<Pagination rowsPerPageOptions={[25, 50, 100]} />}
    title="Artists"
    empty={<EmptyArtists />}
    emptyWhileLoading
    filters={ArtistFilters}
    actions={<ListActions />}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="stageName" label="Stage Name" sortable />
      <TextField source="name" label="Real Name" sortable={false} />
      <TextField source="email" label="Email" sortable={false} />
      <TextField source="phoneNumber" label="Phone" sortable={false} />
      <VerificationStatusField />
      <BooleanField source="isAcceptingBookings" label="Accepting" sortable={false} />
      <NumberField
        source="averageRating"
        label="Rating"
        sortable
        options={{ maximumFractionDigits: 1 }}
      />
      <NumberField source="totalReviews" label="Reviews" sortable={false} />
      <NumberField source="totalServices" label="Services" sortable />
      <DateField source="createdAt" label="Created" showTime sortBy="createdAt" />
      <DateField source="verifiedAt" label="Verified" showTime sortable={false} />
    </Datagrid>
  </List>
);

export default ArtistsList;
