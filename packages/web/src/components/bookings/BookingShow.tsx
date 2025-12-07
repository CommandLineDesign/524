import {
  ArrayField,
  Datagrid,
  DateField,
  FunctionField,
  Labeled,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

const formatCurrency = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KRW' }).format(value)
    : '';

const BookingShow = () => (
  <Show title="Booking Details">
    <SimpleShowLayout>
      <TextField source="bookingNumber" label="Booking #" />
      <TextField source="status" label="Status" />
      <TextField source="paymentStatus" label="Payment Status" />
      <DateField source="scheduledStartTime" label="Scheduled Start" showTime />
      <DateField source="scheduledEndTime" label="Scheduled End" showTime />
      <FunctionField label="Customer" render={(record) => record?.customer?.name ?? ''} />
      <FunctionField
        label="Customer Contact"
        render={(record) => record?.customer?.phoneNumber ?? ''}
      />
      <FunctionField label="Artist" render={(record) => record?.artist?.name ?? ''} />
      <FunctionField
        label="Artist Contact"
        render={(record) => record?.artist?.phoneNumber ?? ''}
      />
      <TextField source="occasion" label="Occasion" />
      <FunctionField
        label="Total Amount"
        render={(record) => formatCurrency(record?.totalAmount)}
      />
      <Labeled label="Location">
        <FunctionField
          render={(record) =>
            record?.location?.address ? JSON.stringify(record.location.address) : 'N/A'
          }
        />
      </Labeled>

      <ArrayField source="services" label="Services">
        <Datagrid bulkActionButtons={false}>
          <TextField source="name" label="Service" />
          <FunctionField
            label="Duration (min)"
            render={(item) => (item?.durationMinutes ? `${item.durationMinutes}` : '')}
          />
          <FunctionField label="Price" render={(item) => formatCurrency(item?.price)} />
        </Datagrid>
      </ArrayField>

      <ArrayField source="statusHistory" label="Status History">
        <Datagrid bulkActionButtons={false}>
          <TextField source="status" label="Status" />
          <DateField source="timestamp" label="Timestamp" showTime />
        </Datagrid>
      </ArrayField>

      <ArrayField source="messages" label="Message Thread">
        <Datagrid bulkActionButtons={false}>
          <DateField source="sentAt" label="Sent At" showTime />
          <TextField source="senderRole" label="Sender Role" />
          <TextField source="messageType" label="Type" />
          <TextField source="content" label="Content" />
        </Datagrid>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default BookingShow;
