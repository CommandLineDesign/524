import { useState } from 'react';
import {
  Button,
  Confirm,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRedirect,
  useRefresh,
} from 'react-admin';

import type { PendingArtistDetail } from '@524/shared';
import type { AdminDataProvider } from '../../lib/adminDataProvider';

const ActivateArtistButton = () => {
  const record = useRecordContext<PendingArtistDetail>();
  const dataProvider = useDataProvider<AdminDataProvider>();
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!record || record.verificationStatus !== 'pending_review') {
    return null;
  }

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await dataProvider.activatePendingArtist(record.id);
      notify('Artist activated successfully', { type: 'success' });
      redirect('/pending-artists');
      refresh();
    } catch (error) {
      const message = (error as Error)?.message || 'Failed to activate artist. Please try again.';
      notify(message, { type: 'error' });
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <Button
        label="Activate"
        variant="contained"
        color="primary"
        disabled={isLoading}
        onClick={() => setIsConfirmOpen(true)}
      />
      <Confirm
        isOpen={isConfirmOpen}
        loading={isLoading}
        title="Activate artist?"
        content={`Activate ${record.stageName || record.name}? They will be able to receive bookings.`}
        onConfirm={handleConfirm}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default ActivateArtistButton;
