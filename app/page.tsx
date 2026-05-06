'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentsIcon from '@mui/icons-material/Payments';
import {
  useTodayMenu,
  useCreateSelection,
  useDeleteSelection,
  useUpdateMenu,
  useConfirmAllPayments,
} from './hooks/useApi';
import MenuCard from './components/MenuCard';
import SelectionCard from './components/SelectionCard';
import SummaryCard from './components/SummaryCard';
import CreateMenuDialog from './components/CreateMenuDialog';
import SelectItemDialog from './components/SelectItemDialog';

export default function HomePage() {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<typeof menu | null>(null);
  const [selectItemOpen, setSelectItemOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentPersonName, setCurrentPersonName] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('quick-lunch-name') : '') || ''
  );

  const { data: menu, isLoading, error, refetch } = useTodayMenu();
  const createSelection = useCreateSelection();
  const deleteSelection = useDeleteSelection();
  const updateMenu = useUpdateMenu();
  const confirmAllPayments = useConfirmAllPayments();

  useEffect(() => {
    if (currentPersonName) {
      localStorage.setItem('quick-lunch-name', currentPersonName);
    }
  }, [currentPersonName]);

  const handleCreateMenuSuccess = () => {
    refetch();
    showSnackbar('Tạo menu thành công!', 'success');
  };

  const handleEditMenuSuccess = () => {
    setEditingMenu(null);
    refetch();
    showSnackbar('Cập nhật menu thành công!', 'success');
  };

  const handleAddSelection = async (menuItemId: string, personName: string, quantity: number = 1) => {
    setCurrentPersonName(personName);
    try {
      for (let i = 0; i < quantity; i++) {
        await createSelection.mutateAsync({ menuItemId, personName });
      }
      showSnackbar(`Đã thêm ${quantity} lựa chọn!`, 'success');
    } catch {
      showSnackbar('Không thể thêm lựa chọn', 'error');
    }
  };

  const handleRemoveSelection = async (selectionId: string) => {
    try {
      await deleteSelection.mutateAsync({ selectionId });
      showSnackbar('Đã xóa lựa chọn', 'success');
    } catch {
      showSnackbar('Không thể xóa lựa chọn', 'error');
    }
  };

  const handleRemoveAllSelections = async (menuItemId: string) => {
    try {
      await deleteSelection.mutateAsync({ menuItemId, personName: currentPersonName });
      showSnackbar('Đã xóa tất cả lựa chọn của bạn', 'success');
    } catch {
      showSnackbar('Không thể xóa lựa chọn', 'error');
    }
  };

  const handleLockToggle = async () => {
    if (!menu) return;
    try {
      await updateMenu.mutateAsync({
        id: menu.id,
        isLocked: !menu.isLocked,
      });
      showSnackbar(
        menu.isLocked ? 'Đã mở khóa đơn hàng!' : 'Đã chốt đơn hàng!',
        'success'
      );
    } catch {
      showSnackbar('Đã chốt đơn, không cho mở khoá đâu hehe!', 'error');
    }
  };

  const handleConfirmPayment = async (menuId: string, personName: string) => {
    try {
      await confirmAllPayments.mutateAsync({ menuId, personName });
      showSnackbar(`Đã xác nhận thanh toán cho ${personName}!`, 'success');
    } catch {
      showSnackbar('Không thể xác nhận thanh toán', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const existingNames = menu
    ? [...new Set(menu.items.flatMap((item) => item.selections.map((s) => s.personName)))]
    : [];

  const hasCurrentUserPaid = useMemo(() => {
    if (!menu || !currentPersonName) return false;
    return menu.items.every((item) =>
      item.selections
        .filter((s) => s.personName === currentPersonName)
        .every((s) => s.isPaid)
    );
  }, [menu, currentPersonName]);

  const hasCurrentUserSelections = useMemo(() => {
    if (!menu || !currentPersonName) return false;
    return menu.items.some((item) =>
      item.selections.some((s) => s.personName === currentPersonName)
    );
  }, [menu, currentPersonName]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          🍱 Order
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentPersonName && hasCurrentUserSelections && !hasCurrentUserPaid && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PaymentsIcon />}
              onClick={() => {
                if (menu) {
                  handleConfirmPayment(menu.id, currentPersonName);
                }
              }}
              disabled={confirmAllPayments.isPending}
            >
              Thanh Toán
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateMenuOpen(true)}
            disabled={!!menu && !menu.isLocked}
          >
            Menu Mới
          </Button>
        </Box>
      </Box>

      {menu ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <MenuCard
              menu={menu}
              onEdit={() => setEditingMenu(menu)}
              isLoading={updateMenu.isPending}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SelectionCard
              items={menu.items}
              isLocked={menu.isLocked}
              onAddSelection={() => setSelectItemOpen(true)}
              onRemoveSelection={handleRemoveSelection}
              onRemoveAllSelections={handleRemoveAllSelections}
              currentPersonName={currentPersonName}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SummaryCard
              items={menu.items}
              isLocked={menu.isLocked}
              onLockToggle={handleLockToggle}
              isLocking={updateMenu.isPending}
              currentPersonName={currentPersonName}
            />
          </Grid>
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Chưa có menu hôm nay
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Hãy tạo menu để bắt đầu!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateMenuOpen(true)}
          >
            Tạo Menu Mới
          </Button>
        </Box>
      )}

      <CreateMenuDialog
        open={createMenuOpen || !!editingMenu}
        onClose={() => {
          setCreateMenuOpen(false);
          setEditingMenu(null);
        }}
        onSuccess={editingMenu ? handleEditMenuSuccess : handleCreateMenuSuccess}
        editMenu={editingMenu}
      />

      {menu && (
        <SelectItemDialog
          open={selectItemOpen}
          onClose={() => setSelectItemOpen(false)}
          items={menu.items}
          onSelect={handleAddSelection}
          existingNames={existingNames}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
