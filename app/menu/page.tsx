"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Link from "next/link";
import { useActiveMenus, useCreateMenu } from "../hooks/useApi";
import CreateMenuDialog from "../components/CreateMenuDialog";

export default function MenuPage() {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: menus, isLoading, error, refetch } = useActiveMenus();
  const createMenu = useCreateMenu();

  const handleCreateMenuSuccess = () => {
    refetch();
    showSnackbar("Create menu successfully!", "success");
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

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
        An error occurred while loading data. Please try again.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => setCreateMenuOpen(true)}
        >
          New Menu
        </Button>
      </Box>

      {menus && menus.length === 0 ? (
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
            Chưa có menu nào
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hãy tạo menu để bắt đầu!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {menus?.map((menu) => {
            const totalSelections = menu.items.reduce(
              (acc, item) => acc + item.selections.length,
              0,
            );
            const uniquePeople = new Set(
              menu.items.flatMap((item) =>
                item.selections.map((s) => s.personName),
              ),
            );

            const formattedDate = new Date(menu.date).toLocaleDateString(
              "vi-VN",
              {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              },
            );

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={menu.id}>
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
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6">
                        Menu: <strong>{menu.creatorName}</strong>
                      </Typography>
                      <Chip
                        icon={<LockOpenIcon />}
                        label="Open"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo: {formattedDate}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        📋 {menu.items.length} món
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        👥 {uniquePeople.size} người
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        📝 {totalSelections} lựa chọn
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <CreateMenuDialog
        open={createMenuOpen}
        onClose={() => setCreateMenuOpen(false)}
        onSuccess={handleCreateMenuSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
