'use client';

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import type { MenuWithItems } from '../lib/types';

interface MenuCardProps {
  menu: MenuWithItems;
  onEdit: () => void;
  isLoading: boolean;
}

export default function MenuCard({ menu, onEdit, isLoading }: MenuCardProps) {
  const formattedDate = new Date(menu.date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontSize: '24px' }}>
            📋 Menu hôm nay
          </Typography>
          {menu.isLocked && (
            <Chip
              icon={<LockIcon />}
              label="Đã chốt"
              color="error"
              size="small"
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Ngày: {formattedDate}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Người tạo: <strong>{menu.creatorName}</strong>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Danh sách món ({menu.items.length} món):
        </Typography>

        <List dense disablePadding>
          {menu.items.map((item, index) => (
            <ListItem key={item.id} disablePadding sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 20 }}
                    >
                      {index + 1}.
                    </Typography>
                    <Typography component="span" variant="body1">
                      {item.name}
                    </Typography>
                    {item.notes && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        + {item.notes}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={onEdit}
          disabled={isLoading || menu.isLocked}
        >
          Sửa menu
        </Button>
      </CardActions>
    </Card>
  );
}
