'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CloseIcon from '@mui/icons-material/Close';
import {
  useHistory,
  useMenuDetail,
} from '../hooks/useApi';
import type { HistoryMenu, SelectionSummary } from '../lib/types';

function HistoryItem({
  menu,
  onClick,
}: {
  menu: HistoryMenu;
  onClick: () => void;
}) {
  const formattedDate = new Date(menu.date).toLocaleDateString('vi-VN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6">{formattedDate}</Typography>
          {menu.isLocked ? (
            <Chip
              icon={<LockIcon />}
              label="Đã chốt"
              color="error"
              size="small"
            />
          ) : (
            <Chip
              icon={<LockOpenIcon />}
              label="Mở"
              color="success"
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Người tạo: <strong>{menu.creatorName}</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            📋 {menu.totalItems} món
          </Typography>
          <Typography variant="caption" color="text.secondary">
            👥 {menu.totalSelections} lượt chọn
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function MenuDetailDialog({
  menuId,
  open,
  onClose,
}: {
  menuId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: menu, isLoading } = useMenuDetail(menuId || '');

  if (!menuId) return null;

  const itemSummary: SelectionSummary[] = menu
    ? menu.items
        .filter((item) => item.selections.length > 0)
        .map((item) => ({
          itemId: item.id,
          itemName: item.name,
          totalCount: item.selections.length,
          notes: item.notes,
          people: item.selections.map((s) => s.personName),
        }))
        .sort((a, b) => b.totalCount - a.totalCount)
    : [];

  const formattedDate = menu
    ? new Date(menu.date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Chi tiết: {formattedDate}</span>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : menu ? (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Người tạo: <strong>{menu.creatorName}</strong>
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
              Tổng Kết:
            </Typography>
            {itemSummary.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Không có lựa chọn nào
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {itemSummary.map((item) => (
                  <Box
                    key={item.itemId}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      p: 1,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                    }}
                  >
                    <Chip label={`${item.totalCount}`} size="small" color="primary" sx={{ mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {item.itemName}
                        {item.notes && (
                          <Typography component="span" variant="caption" color="text.secondary">
                            {' '}
                            + {item.notes}
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({item.people.join(', ')})
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
              Tất cả món ({menu.items.length}):
            </Typography>
            <List dense>
              {menu.items.map((item, index) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {index + 1}.
                        </Typography>
                        <Typography component="span" variant="body1">
                          {item.name}
                        </Typography>
                        {item.notes && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            + {item.notes}
                          </Typography>
                        )}
                        {item.selections.length > 0 && (
                          <Chip
                            label={`x${item.selections.length}`}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      item.selections.length > 0
                        ? `(${item.selections.map((s) => s.personName).join(', ')})`
                        : undefined
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function HistoryPage() {
  const { data: history, isLoading, error } = useHistory();
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

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
        Đã xảy ra lỗi khi tải lịch sử. Vui lòng thử lại.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        📜 Lịch sử
      </Typography>

      {history && history.length === 0 ? (
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
            Chưa có lịch sử
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Các menu đã tạo sẽ xuất hiện ở đây
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {history?.map((menu) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={menu.id}>
              <HistoryItem menu={menu} onClick={() => setSelectedMenuId(menu.id)} />
            </Grid>
          ))}
        </Grid>
      )}

      <MenuDetailDialog
        menuId={selectedMenuId}
        open={selectedMenuId !== null}
        onClose={() => setSelectedMenuId(null)}
      />
    </Box>
  );
}
