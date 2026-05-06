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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  useHistory,
  useMenuDetail,
} from '../hooks/useApi';
import type { HistoryMenu } from '../lib/types';

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

  const isFullyPaid = menu.paidSelections === menu.totalPeople && menu.totalPeople > 0;

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
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isFullyPaid && (
              <Chip
                icon={<CheckCircleIcon />}
                label="đã TT"
                color="success"
                size="small"
              />
            )}
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
        </Box>
        <Typography variant="body2" color="text.secondary">
          Người tạo: <strong>{menu.creatorName}</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            📋 {menu.totalItems} món
          </Typography>
          <Typography variant="caption" color="text.secondary">
            👥 {menu.totalPeople} người
          </Typography>
          {!isFullyPaid && menu.totalPeople > 0 && (
            <Typography variant="caption" color="warning.main">
              💰 {menu.paidSelections}/{menu.totalPeople} đã TT
            </Typography>
          )}
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

  const personSummary = menu
    ? (() => {
        const personMap = new Map<string, { items: string[]; count: number; paidCount: number }>();
        menu.items.forEach((item) => {
          item.selections.forEach((selection) => {
            const existing = personMap.get(selection.personName);
            if (existing) {
              existing.items.push(item.name);
              existing.count += 1;
              if (selection.isPaid) existing.paidCount += 1;
            } else {
              personMap.set(selection.personName, {
                items: [item.name],
                count: 1,
                paidCount: selection.isPaid ? 1 : 0,
              });
            }
          });
        });
        return Array.from(personMap.entries())
          .map(([personName, data]) => ({
            personName,
            items: data.items,
            totalItems: data.count,
            paidItems: data.paidCount,
            isFullyPaid: data.paidCount === data.count,
          }))
          .sort((a, b) => {
            if (a.isFullyPaid !== b.isFullyPaid) return a.isFullyPaid ? 1 : -1;
            return b.totalItems - a.totalItems;
          });
      })()
    : [];

  const paidCount = personSummary.filter((p) => p.isFullyPaid).length;
  const unpaidCount = personSummary.length - paidCount;

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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Tổng kết:
              </Typography>
              {unpaidCount > 0 && (
                <Chip
                  label={`${unpaidCount} chưa TT`}
                  color="warning"
                  size="small"
                />
              )}
            </Box>

            {personSummary.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Không có lựa chọn nào
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {personSummary.map((person) => (
                  <Box key={person.personName} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {person.personName}
                      </Typography>
                      {!person.isFullyPaid && (
                        <Chip
                          icon={<CancelIcon />}
                          label="chưa TT"
                          color="warning"
                          size="small"
                          sx={{ height: 20 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {(() => {
                        const countMap = new Map<string, number>();
                        person.items.forEach((item) => {
                          countMap.set(item, (countMap.get(item) || 0) + 1);
                        });
                        return Array.from(countMap.entries())
                          .map(([name, count]) => (count > 1 ? `${name} x${count}` : name))
                          .join(', ');
                      })()}
                    </Typography>
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
                        ? `(${(() => {
                            const countMap = new Map<string, number>();
                            item.selections.forEach((s) => {
                              countMap.set(s.personName, (countMap.get(s.personName) || 0) + 1);
                            });
                            return Array.from(countMap.entries())
                              .map(([name, count]) => (count > 1 ? `${name} x${count}` : name))
                              .join(', ');
                          })()})`
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
