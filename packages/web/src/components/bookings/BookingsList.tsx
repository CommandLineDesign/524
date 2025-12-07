import {
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

const statusChoices = [
  { id: 'pending', name: 'Pending' },
  { id: 'confirmed', name: 'Confirmed' },
  { id: 'completed', name: 'Completed' },
  { id: 'cancelled', name: 'Cancelled' },
];

const dateRangeChoices = [
  { id: 'today', name: "Today's bookings" },
  { id: 'this_week', name: 'This week' },
];

const BookingFilters = [
  <SearchInput key="search" source="q" alwaysOn placeholder="Booking ID, customer, artist" />,
  <SelectInput key="status" source="status" choices={statusChoices} alwaysOn={false} />,
  <SelectInput key="dateRange" source="dateRange" choices={dateRangeChoices} alwaysOn={false} />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton filters={BookingFilters} />
  </TopToolbar>
);

const BookingsList = () => (
  <List
    perPage={25}
    sort={{ field: 'createdAt', order: 'DESC' }}
    pagination={<Pagination rowsPerPageOptions={[25, 50, 100]} />}
    title="Bookings"
    emptyWhileLoading
    filters={BookingFilters}
    actions={<ListActions />}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="bookingNumber" label="Booking #" />
      <TextField source="customerName" label="Customer" />
      <TextField source="artistName" label="Artist" />
      <TextField source="status" label="Status" />
      <TextField source="paymentStatus" label="Payment" />
      <DateField source="scheduledStartTime" label="Scheduled" showTime />
      <FunctionField
        label="Total"
        render={(record) =>
          typeof record.totalAmount === 'number'
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KRW' }).format(
                record.totalAmount
              )
            : ''
        }
      />
      <DateField source="createdAt" label="Created" showTime />
    </Datagrid>
  </List>
);

export default BookingsList;
