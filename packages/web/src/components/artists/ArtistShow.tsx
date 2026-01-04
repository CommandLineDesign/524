import { Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import {
  BooleanField,
  DateField,
  EmailField,
  FunctionField,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
  useRecordContext,
} from 'react-admin';

type PortfolioImage = {
  url: string;
  caption?: string;
};

type ServiceOffering = {
  name: string;
  description?: string;
  price: number;
};

type ArtistLocation = {
  latitude: number;
  longitude: number;
  address?: string;
};

type ArtistRecord = {
  id: string;
  userId: string;
  stageName: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  verificationStatus: string;
  isAcceptingBookings: boolean;
  averageRating: number | null;
  totalReviews: number;
  totalServices: number;
  completedServices: number;
  cancelledServices: number;
  createdAt: string;
  verifiedAt: string | null;
  bio: string | null;
  specialties: string[];
  yearsExperience: number;
  businessVerified: boolean;
  businessRegistrationNumber: string | null;
  serviceRadiusKm: number;
  primaryLocation: ArtistLocation | null;
  portfolioImages: PortfolioImage[];
  services: ServiceOffering[];
  profileImageUrl: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
};

const VerificationStatusChip = () => {
  const record = useRecordContext<ArtistRecord>();
  if (!record) return null;

  const status = record.verificationStatus;
  const colorMap: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
    pending_review: 'warning',
    in_review: 'info',
    verified: 'success',
    rejected: 'error',
    suspended: 'default',
  };
  const labelMap: Record<string, string> = {
    pending_review: 'Pending Review',
    in_review: 'In Review',
    verified: 'Verified',
    rejected: 'Rejected',
    suspended: 'Suspended',
  };

  return (
    <Chip label={labelMap[status] ?? status} color={colorMap[status] ?? 'default'} size="small" />
  );
};

const SpecialtiesField = () => {
  const record = useRecordContext<ArtistRecord>();
  if (!record?.specialties?.length) return <Typography color="text.secondary">None</Typography>;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {record.specialties.map((specialty) => (
        <Chip key={specialty} label={specialty} size="small" variant="outlined" />
      ))}
    </Stack>
  );
};

const LocationField = () => {
  const record = useRecordContext<ArtistRecord>();
  if (!record?.primaryLocation) return <Typography color="text.secondary">Not set</Typography>;

  const { latitude, longitude, address } = record.primaryLocation;
  return (
    <Box>
      {address && <Typography>{address}</Typography>}
      <Typography variant="body2" color="text.secondary">
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Typography>
    </Box>
  );
};

const PortfolioSection = () => {
  const record = useRecordContext<ArtistRecord>();
  if (!record?.portfolioImages?.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No portfolio images
      </Typography>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {record.portfolioImages.map((image, index) => (
        <Grid item xs={12} sm={6} md={4} key={image.url}>
          <Card variant="outlined">
            <Box
              component="img"
              src={image.url}
              alt={image.caption || `Portfolio ${index + 1}`}
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23eee" width="100" height="100"/><text fill="%23999" font-size="12" x="50%" y="50%" text-anchor="middle" dy=".3em">No Image</text></svg>';
              }}
            />
            {image.caption && (
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {image.caption}
                </Typography>
              </CardContent>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const ServicesSection = () => {
  const record = useRecordContext<ArtistRecord>();
  if (!record?.services?.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No services listed
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {record.services.map((service, index) => (
        <Card key={service.id || `${service.name}-${index}`} variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>
                  {service.name}
                </Typography>
                {service.description && (
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                )}
              </Box>
              <Typography variant="h6" color="primary">
                ${service.price}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

const StatsSection = () => {
  const record = useRecordContext<ArtistRecord>();
  if (!record) return null;

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={6} sm={3}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{record.averageRating?.toFixed(1) ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Rating
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{record.totalReviews}</Typography>
            <Typography variant="body2" color="text.secondary">
              Reviews
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{record.completedServices}</Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{record.cancelledServices}</Typography>
            <Typography variant="body2" color="text.secondary">
              Cancelled
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const ProfileImageField = () => {
  const record = useRecordContext<ArtistRecord>();
  if (!record?.profileImageUrl) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        component="img"
        src={record.profileImageUrl}
        alt={record.stageName}
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #eee',
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </Box>
  );
};

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
    {children}
  </Typography>
);

const ArtistShow = () => (
  <Show title="Artist Details">
    <SimpleShowLayout>
      <ProfileImageField />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <VerificationStatusChip />
        <FunctionField
          render={(record: ArtistRecord) =>
            record?.isAcceptingBookings ? (
              <Chip label="Accepting Bookings" color="success" size="small" variant="outlined" />
            ) : (
              <Chip
                label="Not Accepting Bookings"
                color="default"
                size="small"
                variant="outlined"
              />
            )
          }
        />
      </Stack>

      <SectionHeader>Basic Information</SectionHeader>
      <TextField source="id" label="Artist ID" />
      <TextField source="userId" label="User ID" />
      <TextField source="stageName" label="Stage Name" />
      <TextField source="name" label="Real Name" />
      <EmailField source="email" label="Email" />
      <TextField source="phoneNumber" label="Phone Number" />
      <NumberField source="yearsExperience" label="Years of Experience" />

      <SectionHeader>Bio</SectionHeader>
      <FunctionField
        render={(record: ArtistRecord) => (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {record?.bio || 'No bio provided'}
          </Typography>
        )}
      />

      <SectionHeader>Specialties</SectionHeader>
      <SpecialtiesField />

      <SectionHeader>Statistics</SectionHeader>
      <StatsSection />

      <SectionHeader>Location & Service Area</SectionHeader>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Primary Location
        </Typography>
        <LocationField />
      </Box>
      <NumberField source="serviceRadiusKm" label="Service Radius (km)" />

      <SectionHeader>Business Verification</SectionHeader>
      <BooleanField source="businessVerified" label="Business Verified" />
      <TextField
        source="businessRegistrationNumber"
        label="Business Registration #"
        emptyText="Not provided"
      />

      <Divider sx={{ my: 2 }} />

      <SectionHeader>Services Offered</SectionHeader>
      <ServicesSection />

      <SectionHeader>Portfolio</SectionHeader>
      <PortfolioSection />

      <Divider sx={{ my: 2 }} />

      <SectionHeader>Admin Review</SectionHeader>
      <TextField source="reviewedBy" label="Reviewed By" emptyText="Not reviewed" />
      <DateField source="reviewedAt" label="Reviewed At" showTime emptyText="Not reviewed" />
      <FunctionField
        label="Review Notes"
        render={(record: ArtistRecord) => (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {record?.reviewNotes || 'No notes'}
          </Typography>
        )}
      />

      <SectionHeader>Timestamps</SectionHeader>
      <DateField source="createdAt" label="Created At" showTime />
      <DateField source="verifiedAt" label="Verified At" showTime emptyText="Not verified" />
    </SimpleShowLayout>
  </Show>
);

export default ArtistShow;
