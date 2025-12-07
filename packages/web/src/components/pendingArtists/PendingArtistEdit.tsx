import {
  ArrayInput,
  Edit,
  NumberInput,
  SaveButton,
  SelectArrayInput,
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
          <TextInput source="caption" label="Caption" fullWidth />
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
