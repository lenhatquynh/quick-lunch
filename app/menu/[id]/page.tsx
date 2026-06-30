"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useMenuDetail,
  useCreateSelection,
  useDeleteSelection,
  useUpdateMenu,
} from "../../hooks/useApi";
import MenuCard from "../../components/MenuCard";
import SelectionCard from "../../components/SelectionCard";
import SummaryCard from "../../components/SummaryCard";
import SelectItemDialog from "../../components/SelectItemDialog";
import CreateMenuDialog from "../../components/CreateMenuDialog";

export default function MenuDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [selectItemOpen, setSelectItemOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [currentPersonName, setCurrentPersonName] = useState(
    () =>
      (typeof window !== "undefined"
        ? localStorage.getItem("quick-lunch-name")
        : "") || "",
  );

  const { data: menu, isLoading, error } = useMenuDetail(params.id);
  const createSelection = useCreateSelection();
  const deleteSelection = useDeleteSelection();
  const updateMenu = useUpdateMenu();

  useEffect(() => {
    if (currentPersonName) {
      localStorage.setItem("quick-lunch-name", currentPersonName);
    }
  }, [currentPersonName]);

  const handleAddSelection = async (
    menuItemId: string,
    personName: string,
    quantity: number = 1,
  ) => {
    setCurrentPersonName(personName);
    try {
      for (let i = 0; i < quantity; i++) {
        await createSelection.mutateAsync({ menuItemId, personName });
      }
      showSnackbar(`Added ${quantity} selections!`, "success");
    } catch {
      showSnackbar("Không thể thêm lựa chọn", "error");
    }
  };

  const handleRemoveSelection = async (selectionId: string) => {
    try {
      await deleteSelection.mutateAsync({ selectionId });
      showSnackbar("Đã xóa lựa chọn", "success");
    } catch {
      showSnackbar("Không thể xóa lựa chọn", "error");
    }
  };

  const handleRemoveAllSelections = async (menuItemId: string) => {
    try {
      await deleteSelection.mutateAsync({
        menuItemId,
        personName: currentPersonName,
      });
      showSnackbar("Đã xóa tất cả lựa chọn của bạn", "success");
    } catch {
      showSnackbar("Không thể xóa lựa chọn", "error");
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
        menu.isLocked ? "Đã mở khóa đơn hàng!" : "Đã chốt đơn hàng!",
        "success",
      );
    } catch {
      showSnackbar("Đã chốt đơn, không cho mở khoá đâu hehe!", "error");
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const existingNames = menu
    ? [
        ...new Set(
          menu.items.flatMap((item) =>
            item.selections.map((s) => s.personName),
          ),
        ),
      ]
    : [];

  const menuDate = useMemo(() => {
    if (!menu) return null;
    return new Date(menu.date);
  }, [menu]);

  const formattedDate = useMemo(() => {
    if (!menuDate) return "";
    return menuDate.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [menuDate]);

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
        Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
      </Alert>
    );
  }

  if (!menu) {
    return (
      <Box sx={{ maxWidth: 1400, mx: "auto", textAlign: "center", py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Không tìm thấy menu
        </Typography>
        <Button
          component={Link}
          href="/menu"
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Quay lại Menu
        </Button>
      </Box>
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
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, width: "100%" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: "bold" }}>
              {menu.creatorName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {formattedDate}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MenuCard
            menu={menu}
            onEdit={() => setEditMenuOpen(true)}
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
          />
        </Grid>
      </Grid>

      <SelectItemDialog
        open={selectItemOpen}
        onClose={() => setSelectItemOpen(false)}
        items={menu.items}
        onSelect={handleAddSelection}
        existingNames={existingNames}
      />

      <CreateMenuDialog
        open={editMenuOpen}
        onClose={() => setEditMenuOpen(false)}
        onSuccess={() => {
          setEditMenuOpen(false);
        }}
        editMenu={menu}
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
