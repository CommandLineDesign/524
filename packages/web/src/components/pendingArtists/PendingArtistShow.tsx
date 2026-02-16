import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import {
  ArrayField,
  ChipField,
  DateField,
  FunctionField,
  Show,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  useRecordContext,
} from 'react-admin';

type PortfolioImage = {
  url: string;
  caption?: string;
  serviceCategory?: string;
};

type PendingArtistRecord = {
  portfolioImages?: PortfolioImage[];
};

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'hair':
      return 'Hair';
    case 'makeup':
      return 'Makeup';
    case 'nails':
      return 'Nails';
    case 'skincare':
      return 'Skincare';
    default:
      return 'Other';
  }
};

const getCategoryColor = (
  category: string
): 'primary' | 'secondary' | 'success' | 'error' | 'default' => {
  switch (category) {
    case 'hair':
      return 'primary';
    case 'makeup':
      return 'secondary';
    case 'nails':
      return 'success';
    case 'skincare':
      return 'error';
    default:
      return 'default';
  }
};

const PortfolioSection = () => {
  const record = useRecordContext<PendingArtistRecord>();
  if (!record?.portfolioImages?.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No portfolio images
      </Typography>
    );
  }

  // Group images by category
  const grouped = record.portfolioImages.reduce(
    (acc, image) => {
      const category = image.serviceCategory || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(image);
      return acc;
    },
    {} as Record<string, PortfolioImage[]>
  );

  return (
    <Stack spacing={3} sx={{ mt: 1 }}>
      {Object.entries(grouped).map(([category, images]) => (
        <Box key={category}>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
            {getCategoryLabel(category)}
          </Typography>
          <Grid container spacing={2}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={image.url}>
                <Card variant="outlined">
                  <Box sx={{ position: 'relative', backgroundColor: '#f5f5f5' }}>
                    <Box
                      component="img"
                      src={image.url}
                      alt={image.caption || `Portfolio ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 300,
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23eee" width="100" height="100"/><text fill="%23999" font-size="12" x="50%" y="50%" text-anchor="middle" dy=".3em">No Image</text></svg>';
                      }}
                    />
                    <Chip
                      label={getCategoryLabel(category)}
                      color={getCategoryColor(category)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                      }}
                    />
                  </Box>
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
        </Box>
      ))}
    </Stack>
  );
};

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
    {children}
  </Typography>
);

const PendingArtistShow = () => (
  <Show>
    <SimpleShowLayout>
      <SectionHeader>Basic Information</SectionHeader>
      <TextField source="name" label="Name" />
      <TextField source="stageName" label="Stage Name" />
      <TextField source="email" label="Email" />
      <TextField source="phoneNumber" label="Phone" />
      <DateField source="signupDate" label="Signup Date" showTime />
      <TextField source="verificationStatus" label="Status" />

      <SectionHeader>Bio</SectionHeader>
      <FunctionField
        render={(record: { bio?: string | null }) => (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {record?.bio || 'No bio provided'}
          </Typography>
        )}
      />

      <SectionHeader>Specialties</SectionHeader>
      <ArrayField source="specialties" label="" emptyText="No specialties listed">
        <SingleFieldList>
          <ChipField source="" />
        </SingleFieldList>
      </ArrayField>

      <SectionHeader>Portfolio</SectionHeader>
      <PortfolioSection />
    </SimpleShowLayout>
  </Show>
);

export default PendingArtistShow;
