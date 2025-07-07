import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import {
  List,
  FAB,
  Searchbar,
  Card,
  Title,
  Paragraph,
  Button,
  Dialog,
  Portal,
  DataTable,
  Chip,
  IconButton,
  Menu,
  SegmentedButtons,
  Text,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import { format } from "date-fns";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function FeeManagement({ navigation }) {
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [filter, setFilter] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await axios.get("/api/fees");
      setFees(response.data.data);
      filterFees(response.data.data, searchQuery, filter);
    } catch (error) {
      showMessage({
        message: "Error fetching fees",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const filterFees = (feeList, query, status) => {
    let filtered = feeList;

    if (query) {
      filtered = filtered.filter(
        (fee) =>
          fee.studentName.toLowerCase().includes(query.toLowerCase()) ||
          fee.class.toLowerCase().includes(query.toLowerCase()) ||
          fee.type.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((fee) => fee.status === status);
    }

    setFilteredFees(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchFees();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterFees(fees, query, filter);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    filterFees(fees, searchQuery, value);
  };

  const handleStatusChange = async (feeId, newStatus) => {
    try {
      await axios.put(`/api/fees/${feeId}/status`, {
        status: newStatus,
      });

      showMessage({
        message: "Fee status updated",
        type: "success",
      });

      fetchFees();
    } catch (error) {
      showMessage({
        message: "Error updating fee status",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      case "overdue":
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const FeeCard = ({ fee }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card
        style={styles.card}
        onPress={() => {
          setSelectedFee(fee);
          setIsDialogVisible(true);
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Title style={styles.title}>{fee.studentName}</Title>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(fee.status) + "20" }]}
                textStyle={{ color: getStatusColor(fee.status) }}
              >
                {fee.status}
              </Chip>
            </View>
            <IconButton
              icon="dots-vertical"
              onPress={() => {
                setSelectedFeeId(fee._id);
                setMenuVisible(true);
              }}
            />
          </View>

          <View style={styles.feeDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Class:</Text>
              <Text style={styles.value}>{fee.class}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{fee.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={styles.value}>₹{fee.amount}</Text>
            </View>
          </View>

          <View style={styles.metadata}>
            <Text style={styles.dueDate}>Due: {format(new Date(fee.dueDate), "MMM dd, yyyy")}</Text>
            {fee.status === "paid" && (
              <Text style={styles.paidDate}>Paid: {format(new Date(fee.paidDate), "MMM dd, yyyy")}</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search fees..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={filter}
          onValueChange={handleFilterChange}
          buttons={[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "overdue", label: "Overdue" },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredFees.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map((fee) => (
          <FeeCard key={fee._id} fee={fee} />
        ))}
      </ScrollView>

      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(filteredFees.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${page + 1} of ${Math.ceil(filteredFees.length / itemsPerPage)}`}
      />

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Fee Details</Dialog.Title>
          <Dialog.Content>
            {selectedFee && (
              <>
                <View style={styles.dialogDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Student:</Text>
                    <Text style={styles.value}>{selectedFee.studentName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Class:</Text>
                    <Text style={styles.value}>{selectedFee.class}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Fee Type:</Text>
                    <Text style={styles.value}>{selectedFee.type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={styles.value}>₹{selectedFee.amount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Status:</Text>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(selectedFee.status) + "20" }]}
                      textStyle={{ color: getStatusColor(selectedFee.status) }}
                    >
                      {selectedFee.status}
                    </Chip>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Due Date:</Text>
                    <Text style={styles.value}>{format(new Date(selectedFee.dueDate), "MMM dd, yyyy")}</Text>
                  </View>
                  {selectedFee.status === "paid" && (
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Paid Date:</Text>
                      <Text style={styles.value}>{format(new Date(selectedFee.paidDate), "MMM dd, yyyy")}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Close</Button>
            <Button
              onPress={() => {
                setIsDialogVisible(false);
                navigation.navigate("EditFee", {
                  feeId: selectedFee._id,
                });
              }}
            >
              Edit
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Menu
          visible={menuVisible}
          onDismiss={() => {
            setMenuVisible(false);
            setSelectedFeeId(null);
          }}
          anchor={<View />}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedFeeId, "paid");
            }}
            title="Mark as Paid"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedFeeId, "pending");
            }}
            title="Mark as Pending"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedFeeId, "overdue");
            }}
            title="Mark as Overdue"
          />
        </Menu>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("CreateFee")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  searchBar: {
    marginBottom: theme.spacing.sm,
  },
  filterButtons: {
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: {
    ...theme.typography.subtitle1,
    marginRight: theme.spacing.sm,
    flex: 1,
  },
  feeDetails: {
    marginVertical: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    width: 80,
  },
  value: {
    ...theme.typography.body2,
    flex: 1,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  statusChip: {
    marginLeft: theme.spacing.sm,
  },
  dueDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  paidDate: {
    ...theme.typography.caption,
    color: theme.colors.success,
  },
  dialogDetails: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
