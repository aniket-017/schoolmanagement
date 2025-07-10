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
  Chip,
  IconButton,
  Menu,
  SegmentedButtons,
  Text,
  Avatar,
  DataTable,
  Divider,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import { format } from "date-fns";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function SalaryManagement({ navigation }) {
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [filter, setFilter] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const response = await axios.get("/api/salary/records");
      setSalaries(response.data.data);
      filterSalaries(response.data.data, searchQuery, filter);
    } catch (error) {
      showMessage({
        message: "Error fetching salary records",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const filterSalaries = (salaryList, query, status) => {
    let filtered = salaryList;

    if (query) {
      filtered = filtered.filter(
        (salary) =>
          salary.employee.name.toLowerCase().includes(query.toLowerCase()) ||
          salary.employee.employeeId.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((salary) => salary.status === status);
    }

    setFilteredSalaries(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchSalaries();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterSalaries(salaries, query, filter);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    filterSalaries(salaries, searchQuery, value);
  };

  const handleStatusChange = async (salaryId, newStatus) => {
    try {
      await axios.put(`/api/salary/records/${salaryId}/status`, {
        status: newStatus,
      });

      showMessage({
        message: "Salary status updated",
        type: "success",
      });

      fetchSalaries();
    } catch (error) {
      showMessage({
        message: "Error updating salary status",
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
      case "processing":
        return theme.colors.info;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const SalaryCard = ({ salary }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card
        style={styles.card}
        onPress={() => {
          setSelectedSalary(salary);
          setIsDialogVisible(true);
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Avatar.Text
                size={40}
                label={salary.employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
                style={{
                  backgroundColor: theme.colors.primaryLight,
                  marginRight: theme.spacing.sm,
                }}
              />
              <View style={styles.employeeInfo}>
                <Title style={styles.title}>{salary.employee.name}</Title>
                <Paragraph style={styles.employeeId}>{salary.employee.employeeId}</Paragraph>
              </View>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(salary.status) + "20" }]}
              textStyle={{ color: getStatusColor(salary.status) }}
            >
              {salary.status}
            </Chip>
          </View>

          <View style={styles.salaryDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Basic Pay:</Text>
              <Text style={styles.value}>{formatCurrency(salary.basicPay)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Allowances:</Text>
              <Text style={styles.value}>{formatCurrency(salary.allowances)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Deductions:</Text>
              <Text style={styles.value}>{formatCurrency(salary.deductions)}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={[styles.label, styles.totalLabel]}>Net Salary:</Text>
              <Text style={[styles.value, styles.totalValue]}>{formatCurrency(salary.netSalary)}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.dateInfo}>
              <IconButton icon="calendar" size={20} />
              <View>
                <Text style={styles.dateLabel}>Payment Date</Text>
                <Text style={styles.dateValue}>{format(new Date(salary.paymentDate), "dd MMM yyyy")}</Text>
              </View>
            </View>
            <IconButton
              icon="dots-vertical"
              onPress={() => {
                setSelectedSalaryId(salary._id);
                setMenuVisible(true);
              }}
            />
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  const PaymentHistory = ({ history }) => (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Date</DataTable.Title>
        <DataTable.Title>Type</DataTable.Title>
        <DataTable.Title numeric>Amount</DataTable.Title>
      </DataTable.Header>

      {history.map((payment, index) => (
        <DataTable.Row key={index}>
          <DataTable.Cell>{format(new Date(payment.date), "dd MMM yyyy")}</DataTable.Cell>
          <DataTable.Cell>{payment.type}</DataTable.Cell>
          <DataTable.Cell numeric>{formatCurrency(payment.amount)}</DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search employees..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={filter}
          onValueChange={handleFilterChange}
          buttons={[
            { value: "all", label: "All" },
            { value: "paid", label: "Paid" },
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredSalaries.map((salary) => (
          <SalaryCard key={salary._id} salary={salary} />
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title>Salary Details</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {selectedSalary && (
                <View style={styles.dialogContent}>
                  <Title style={styles.dialogTitle}>{selectedSalary.employee.name}</Title>

                  <Card style={styles.infoCard}>
                    <Card.Content>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Employee ID:</Text>
                        <Text style={styles.value}>{selectedSalary.employee.employeeId}</Text>
                      </View>
                      <View style={styles.detailRow}></View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Position:</Text>
                        <Text style={styles.value}>{selectedSalary.employee.position}</Text>
                      </View>
                    </Card.Content>
                  </Card>

                  <Title style={styles.sectionTitle}>Salary Breakdown</Title>
                  <Card style={styles.infoCard}>
                    <Card.Content>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Basic Pay:</Text>
                        <Text style={styles.value}>{formatCurrency(selectedSalary.basicPay)}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>HRA:</Text>
                        <Text style={styles.value}>{formatCurrency(selectedSalary.allowances)}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>DA:</Text>
                        <Text style={styles.value}>{formatCurrency(selectedSalary.dearnessAllowance)}</Text>
                      </View>
                      <Divider style={styles.divider} />
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>PF:</Text>
                        <Text style={styles.value}>{formatCurrency(selectedSalary.providentFund)}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Tax:</Text>
                        <Text style={styles.value}>{formatCurrency(selectedSalary.tax)}</Text>
                      </View>
                      <Divider style={styles.divider} />
                      <View style={styles.detailRow}>
                        <Text style={[styles.label, styles.totalLabel]}>Net Salary:</Text>
                        <Text style={[styles.value, styles.totalValue]}>
                          {formatCurrency(selectedSalary.netSalary)}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>

                  <Title style={styles.sectionTitle}>Payment History</Title>
                  <Card style={styles.infoCard}>
                    <Card.Content>
                      <PaymentHistory history={selectedSalary.paymentHistory} />
                    </Card.Content>
                  </Card>
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Close</Button>
            <Button
              onPress={() => {
                setIsDialogVisible(false);
                navigation.navigate("EditSalary", {
                  salaryId: selectedSalary._id,
                });
              }}
            >
              Edit
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setIsDialogVisible(false);
                navigation.navigate("ProcessPayment", {
                  salaryId: selectedSalary._id,
                });
              }}
            >
              Process Payment
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Menu
          visible={menuVisible}
          onDismiss={() => {
            setMenuVisible(false);
            setSelectedSalaryId(null);
          }}
          anchor={<View />}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedSalaryId, "processing");
            }}
            title="Mark as Processing"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedSalaryId, "paid");
            }}
            title="Mark as Paid"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleStatusChange(selectedSalaryId, "cancelled");
            }}
            title="Cancel Payment"
          />
        </Menu>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("AddSalary")} />
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
  },
  employeeInfo: {
    flex: 1,
  },
  title: {
    ...theme.typography.subtitle1,
    marginBottom: 2,
  },
  employeeId: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  salaryDetails: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    padding: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    width: 100,
  },
  value: {
    ...theme.typography.body2,
    flex: 1,
    textAlign: "right",
  },
  totalLabel: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
  },
  totalValue: {
    ...theme.typography.subtitle1,
    color: theme.colors.primary,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  dateValue: {
    ...theme.typography.body2,
  },
  statusChip: {
    marginLeft: theme.spacing.sm,
  },
  dialog: {
    maxHeight: "80%",
  },
  dialogContent: {
    padding: theme.spacing.md,
  },
  dialogTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h6,
    marginVertical: theme.spacing.md,
  },
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
