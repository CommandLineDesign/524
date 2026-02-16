import { Box, Card, Chip, Typography } from '@mui/material';
import {
  ArrayInput,
  Edit,
  FunctionField,
  NumberInput,
  SaveButton,
  SelectArrayInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
  Toolbar,
  required,
} from 'react-admin';

import ActivateArtistButton from './ActivateArtistButton';

const specialtiesChoices = [
  { id: 'makeup', name: 'Makeup' },
  { id: 'hair', name: 'Hair' },
  { id: 'nails', name: 'Nails' },
  { id: 'skincare', name: 'Skincare' },
];

const serviceCategoryChoices = [
  { id: 'hair', name: 'Hair' },
  { id: 'makeup', name: 'Makeup' },
  { id: 'nails', name: 'Nails' },
  { id: 'skincare', name: 'Skincare' },
];

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

const ArtistEditToolbar = () => (
  <Toolbar>
    <SaveButton alwaysEnable />
    <ActivateArtistButton />
  </Toolbar>
);

const PendingArtistEdit = () => (
  <Edit mutationMode="pessimistic">
    <SimpleForm toolbar={<ArtistEditToolbar />}>
      <TextInput source="stageName" label="Display Name" fullWidth validate={[required()]} />
      <TextInput source="bio" label="Bio" fullWidth multiline minRows={3} validate={[required()]} />
      <SelectArrayInput
        source="specialties"
        label="Specialties"
        choices={specialtiesChoices}
        optionText="name"
        optionValue="id"
        fullWidth
        helperText="Choose at least one specialty"
        validate={[required()]}
      />
      <NumberInput
        source="yearsExperience"
        label="Years of Experience"
        min={0}
        step={1}
        fullWidth
        validate={[required()]}
      />

      <ArrayInput source="portfolioImages" label="Portfolio Images">
        <SimpleFormIterator>
          <TextInput source="url" label="Image URL" fullWidth validate={[required()]} />
          <SelectInput
            source="serviceCategory"
            label="Service Category"
            choices={serviceCategoryChoices}
            fullWidth
            validate={[required()]}
          />
          <TextInput source="caption" label="Caption" fullWidth />
          <FunctionField
            render={(record: { url?: string; serviceCategory?: string; caption?: string }) => {
              if (!record?.url) return null;
              return (
                <Card variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                  <Box sx={{ position: 'relative', backgroundColor: '#f5f5f5' }}>
                    <Box
                      component="img"
                      src={record.url}
                      alt={record.caption || 'Portfolio preview'}
                      sx={{
                        width: '100%',
                        maxHeight: 400,
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {record.serviceCategory && (
                      <Chip
                        label={
                          serviceCategoryChoices.find((c) => c.id === record.serviceCategory)
                            ?.name || record.serviceCategory
                        }
                        color={getCategoryColor(record.serviceCategory)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                      />
                    )}
                  </Box>
                  {record.caption && (
                    <Box sx={{ p: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {record.caption}
                      </Typography>
                    </Box>
                  )}
                </Card>
              );
            }}
          />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="services" label="Service Offerings">
        <SimpleFormIterator>
          <TextInput source="name" label="Name" fullWidth validate={[required()]} />
          <TextInput source="description" label="Description" fullWidth />
          <NumberInput
            source="price"
            label="Price"
            min={0}
            step={1}
            fullWidth
            validate={[required()]}
          />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export default PendingArtistEdit;
