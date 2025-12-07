import { useState } from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField as MuiTextField,
  Stack,
  Typography,
} from '@mui/material';
import {
  BooleanField,
  Button,
  DateField,
  EmailField,
  FunctionField,
  Show,
  SimpleShowLayout,
  TextField,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRefresh,
} from 'react-admin';

import type { AdminDataProvider } from '../../lib/adminDataProvider';

type UserRecord = {
  id: string;
  isBanned?: boolean;
};

const BanControls = () => {
  const record = useRecordContext<UserRecord>();
  const dataProvider = useDataProvider<AdminDataProvider>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!record) return null;

  const closeModal = () => {
    setReason('');
    setModalOpen(false);
  };

  const handleBan = async () => {
    if (!reason.trim()) {
      notify('Please provide a ban reason', { type: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await dataProvider.banUser('users', { id: record.id, reason: reason.trim() });
      notify('User banned successfully', { type: 'success' });
      refresh();
      closeModal();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Failed to ban user', { type: 'warning' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnban = async () => {
    setSubmitting(true);
    try {
      await dataProvider.unbanUser('users', { id: record.id });
      notify('User unbanned successfully', { type: 'success' });
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Failed to unban user', { type: 'warning' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {record.isBanned ? (
          <Button label="Unban User" onClick={handleUnban} disabled={submitting} />
        ) : (
          <Button label="Ban User" onClick={() => setModalOpen(true)} disabled={submitting} />
        )}
      </Stack>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>Ban User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Provide a reason for banning this account. This will be logged for audit purposes.
          </Typography>
          <MuiTextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={submitting}
          />
        </DialogContent>
        <DialogActions>
          <Button label="Cancel" onClick={closeModal} disabled={submitting} />
          <Button
            label="Confirm Ban"
            onClick={handleBan}
            disabled={!reason.trim() || submitting}
            color="error"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

const UserShow = () => (
  <Show title="User Details">
    <SimpleShowLayout>
      <BanControls />
      <TextField source="id" label="ID" />
      <TextField source="name" label="Name" />
      <EmailField source="email" label="Email" />
      <TextField source="phoneNumber" label="Phone Number" />
      <BooleanField source="phoneVerified" label="Phone Verified" />
      <FunctionField
        label="Roles"
        render={(record) => (Array.isArray(record.roles) ? record.roles.join(', ') : '')}
      />
      <BooleanField source="isActive" label="Active" />
      <BooleanField source="isVerified" label="Verified" />
      <BooleanField source="isBanned" label="Banned" />
      <TextField source="banReason" label="Ban Reason" />
      <DateField source="bannedAt" label="Banned At" showTime />
      <TextField source="bannedBy" label="Banned By" />
      <DateField source="createdAt" label="Created At" showTime />
      <DateField source="updatedAt" label="Updated At" showTime />
    </SimpleShowLayout>
  </Show>
);

export default UserShow;
