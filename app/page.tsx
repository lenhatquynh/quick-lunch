'use client';

import { useState, useEffect } from 'react';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  useTodayMenu,
  useCreateMenu,
  useCreateSelection,
  useDeleteSelection,
  useUpdateMenu,
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
  const createMenu = useCreateMenu();
  const createSelection = useCreateSelection();
  const deleteSelection = useDeleteSelection();
  const updateMenu = useUpdateMenu();

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

  const handleAddSelection = async (menuItemId: string, personName: string) => {
    setCurrentPersonName(personName);
    try {
      await createSelection.mutateAsync({ menuItemId, personName });
      showSnackbar('Đã thêm lựa chọn!', 'success');
    } catch (err) {
      showSnackbar('Không thể thêm lựa chọn', 'error');
    }
  };

  const handleRemoveSelection = async (selectionId: string) => {
    try {
      await deleteSelection.mutateAsync({ selectionId });
      showSnackbar('Đã xóa lựa chọn', 'success');
    } catch (err) {
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
    } catch (err) {
      showSnackbar('Đã chốt đơn, không cho mở khoá đâu hehe!', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const existingNames = menu
    ? [...new Set(menu.items.flatMap((item) => item.selections.map((s) => s.personName)))]
    : [];

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          🍱 Trang chủ
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateMenuOpen(true)}
          >
            Tạo Menu Mới
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
              onRemoveAllSelections={() => {}}
              currentPersonName={currentPersonName}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SummaryCard
              items={menu.items}
              isLocked={menu.isLocked}
              onLockToggle={handleLockToggle}
              isLocking={updateMenu.isPending}
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
