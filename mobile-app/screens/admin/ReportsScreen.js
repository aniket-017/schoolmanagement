import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Dimensions, RefreshControl } from "react-native";
import { Card, Title, Paragraph, Button, SegmentedButtons, List, Text } from "react-native-paper";
import { LineChart, PieChart } from "react-native-chart-kit";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [reportType, setReportType] = useState("attendance");
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [timeRange, reportType]);

  const fetchReportData = async () => {
    try {
      let endpoint = "";
      switch (reportType) {
        case "attendance":
          endpoint = "/api/attendance/stats";
          break;
        case "academic":
          endpoint = "/api/grades/stats";
          break;
        case "fees":
          endpoint = "/api/fees/stats";
          break;
      }

      const response = await axios.get(endpoint, {
        params: { timeRange },
      });

      setChartData(response.data.chartData);
      setStats(response.data.stats);
    } catch (error) {
      showMessage({
        message: "Error fetching report data",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
  }, [timeRange, reportType]);

  const renderChart = () => {
    if (!chartData) return null;

    switch (reportType) {
      case "attendance":
        return (
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  data: chartData.values,
                },
              ],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.primary,
              backgroundGradientFrom: theme.colors.primary,
              backgroundGradientTo: theme.colors.primaryDark,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        );
      case "academic":
      case "fees":
        return (
          <PieChart
            data={chartData.map((item, index) => ({
              name: item.label,
              population: item.value,
              color: theme.colors.gradients.primary[index % 2],
              legendFontColor: theme.colors.text,
            }))}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>Key Metrics</Title>
          {Object.entries(stats).map(([key, value]) => (
            <List.Item
              key={key}
              title={key.split("_").join(" ").toUpperCase()}
              description={value}
              left={(props) => <List.Icon {...props} icon="chart-bar" />}
            />
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <Card style={styles.filterCard}>
          <Card.Content>
            <Title style={styles.filterTitle}>Report Filters</Title>
            <SegmentedButtons
              value={reportType}
              onValueChange={setReportType}
              buttons={[
                { value: "attendance", label: "Attendance" },
                { value: "academic", label: "Academic" },
                { value: "fees", label: "Fees" },
              ]}
              style={styles.segmentedButton}
            />
            <SegmentedButtons
              value={timeRange}
              onValueChange={setTimeRange}
              buttons={[
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "year", label: "Year" },
              ]}
              style={styles.segmentedButton}
            />
          </Card.Content>
        </Card>

        <Animatable.View animation="fadeIn" duration={500}>
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</Title>
              {renderChart()}
            </Card.Content>
          </Card>

          {renderStats()}
        </Animatable.View>

        <Button
          mode="contained"
          onPress={() => {
            /* Handle report download */
          }}
          style={styles.downloadButton}
        >
          Download Full Report
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  filterCard: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  filterTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.sm,
  },
  segmentedButton: {
    marginBottom: theme.spacing.sm,
  },
  chartCard: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  chartTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  statsCard: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statsTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.sm,
  },
  downloadButton: {
    marginTop: theme.spacing.md,
  },
});
