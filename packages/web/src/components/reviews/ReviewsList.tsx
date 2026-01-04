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

const visibilityChoices = [
  { id: 'true', name: 'Visible' },
  { id: 'false', name: 'Hidden' },
];

const ReviewFilters = [
  <SearchInput key="search" source="q" alwaysOn placeholder="Review text, customer, artist" />,
  <SelectInput key="isVisible" source="isVisible" choices={visibilityChoices} alwaysOn={false} />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton filters={ReviewFilters} />
  </TopToolbar>
);

const ReviewsList = () => (
  <List
    perPage={25}
    sort={{ field: 'createdAt', order: 'DESC' }}
    pagination={<Pagination rowsPerPageOptions={[25, 50, 100]} />}
    title="Reviews"
    emptyWhileLoading
    filters={ReviewFilters}
    actions={<ListActions />}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="id" label="ID" />
      <FunctionField
        label="Customer"
        render={(record) => record?.customerName || record?.customerId || 'Unknown'}
      />
      <FunctionField
        label="Artist"
        render={(record) => record?.artistName || record?.artistId || 'Unknown'}
      />
      <NumberField source="overallRating" label="Overall" />
      <NumberField source="qualityRating" label="Quality" />
      <NumberField source="professionalismRating" label="Professionalism" />
      <NumberField source="timelinessRating" label="Timeliness" />
      <BooleanField source="isVisible" label="Visible" />
      <TextField source="reviewText" label="Review" />
      <DateField source="createdAt" label="Created" showTime />
    </Datagrid>
  </List>
);

export default ReviewsList;
