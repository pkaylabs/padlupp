export type System = {
  id: number;
  name: string;
  href: string;
  initial: string;
  current: boolean;
};

export type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ReactNode;
  subtitle?: string;
};

export type CustomerOrder = {
  id: number;
  name: string;
  address: string;
  date: string;
  status: "Delivered" | "Processed" | "Cancelled";
  price: string;
  avatar: string;
};

export type ChartData = {
  month: string;
  value1: number;
  value2: number;
};

export type DonutData = {
  label: string;
  value: number;
  color: string;
};

type Status = "Active" | "Completed" | "Pending" | "On Hold";
type Priority = "High" | "Medium" | "Low";

export type ObjectiveFormData = {
  name: string;
  description: string;
  numIndicators: any;
  status: Status;
  priority: Priority;
  assignedTo: string;
  dueDate: string;
  category: string;
};

export type Objective = ObjectiveFormData & {
  id: number;
  createdAt: string;
  progress: number;
};

type Frequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually";

export type IndicatorFormData = {
  name: string;
  description: string;
  baseline: number;
  target: number;
  actual: number;
  unit: string;
  assignee: string;
  category: string;
  objective: string;
  frequency: Frequency;
};

export type Indicator = IndicatorFormData & {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: "On Track" | "At Risk" | "Off Track" | "Achieved";
};

export type IndicatorData = Omit<
  IndicatorFormData,
  "frequency" | "description"
> & {
  id: number;
  status: string;
  trend: "up" | "down" | "stable";
  history: { date: string; value: number }[];
};

export type ReportFilters = {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  objectives: string[];
  indicators: string[];
  categories: string[];
  assignees: string[];
};

export type ObjectiveData = {
  id: number;
  name: string;
  category: string;
  status: string;
  progress: number;
  indicators: IndicatorData[];
};

export interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    department: string;
    timezone: string;
    language: string;
    avatar: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    weeklyReports: boolean;
    objectiveUpdates: boolean;
    indicatorAlerts: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "auto";
    soundEnabled: boolean;
    defaultDashboard: string;
    itemsPerPage: number;
    autoRefresh: boolean;
    refreshInterval: number;
    compactMode: boolean;
  };

  privacy: {
    profileVisibility: "public" | "team" | "private";
    showOnlineStatus: boolean;
    allowDataExport: boolean;
    shareAnalytics: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginNotifications: boolean;
  };
}
