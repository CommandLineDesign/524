import {
  ArrayField,
  BooleanField,
  Datagrid,
  DateField,
  FunctionField,
  ImageField,
  Labeled,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

const ReviewShow = () => (
  <Show title="Review Details">
    <SimpleShowLayout>
      <TextField source="id" label="Review ID" />
      <TextField source="bookingId" label="Booking ID" />
      <FunctionField
        label="Customer"
        render={(record) => record?.customerName || record?.customerId || 'Unknown'}
      />
      <FunctionField
        label="Artist"
        render={(record) => record?.artistName || record?.artistId || 'Unknown'}
      />

      <Labeled label="Ratings">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <NumberField source="overallRating" label="Overall" />
          <NumberField source="qualityRating" label="Quality" />
          <NumberField source="professionalismRating" label="Professionalism" />
          <NumberField source="timelinessRating" label="Timeliness" />
        </div>
      </Labeled>

      <TextField source="reviewText" label="Review Text" />
      <TextField source="artistResponse" label="Artist Response" />

      <BooleanField source="isVisible" label="Is Visible" />

      <DateField source="createdAt" label="Created At" showTime />
      <DateField source="updatedAt" label="Updated At" showTime />

      <ArrayField source="reviewImages" label="Review Images">
        <Datagrid bulkActionButtons={false}>
          <ImageField source="publicUrl" label="Image" />
          <TextField source="fileSize" label="File Size (bytes)" />
          <TextField source="mimeType" label="MIME Type" />
          <NumberField source="displayOrder" label="Display Order" />
          <DateField source="createdAt" label="Uploaded At" showTime />
        </Datagrid>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export default ReviewShow;
