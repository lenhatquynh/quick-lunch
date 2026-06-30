"use client";

import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useHistory } from "../hooks/useApi";
import type { HistoryMenu } from "../lib/types";

function HistoryItem({ menu }: { menu: HistoryMenu }) {
  const formattedDate = new Date(menu.date).toLocaleDateString("vi-VN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      component={Link}
      href={`/menu/${menu.id}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="body2">
            Menu: <strong>{menu.creatorName}</strong>
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {menu.isLocked ? (
              <Chip
                icon={<LockIcon />}
                label="Locked"
                color="error"
                size="small"
              />
            ) : (
              <Chip
                icon={<LockOpenIcon />}
                label="Open"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Ngày tạo: {formattedDate}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            📋 {menu.totalItems} món
          </Typography>
          <Typography variant="caption" color="text.secondary">
            👥 {menu.totalPeople} người
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHistory();

  const history = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
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
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {history.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            textAlign: "center",
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
        <>
          <Grid container spacing={3}>
            {history.map((menu) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={menu.id}>
                <HistoryItem menu={menu} />
              </Grid>
            ))}
          </Grid>

          {hasNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
