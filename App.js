import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context/AuthProvider';

import CustomerLoginScreen from './screens/CustomerLoginScreen';
import EmployeeLoginScreen from './screens/EmployeeLoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import EmployeeDashboardScreen from './screens/EmployeeDashboardScreen';
import LeaguesDashboardScreen from './screens/LeaguesDashboardScreen';
import VolleyballLeagueScreen from './screens/VolleyballLeagueScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ScoreManagementScreen from './screens/ScoreManagementScreen';
import ScheduleCreatorScreen from './screens/ScheduleCreatorScreen';
import AbsenceManagementScreen from './screens/AbsenceManagementScreen';
import TeamMaintenanceScreen from './screens/TeamMaintenanceScreen';
import CreateTeamScreen from './screens/CreateTeamScreen';
import EditTeamScreen from './screens/EditTeamScreen';
import CaptainLoginScreen from './screens/CaptainLoginScreen';
import CaptainDashboardScreen from './screens/CaptainDashboardScreen';
import PlayerManagementScreen from './screens/PlayerManagementScreen';
import WaiverLinkScreen from './screens/WaiverLinkScreen';
import GameDayBannerScreen from './screens/GameDayBannerScreen';
import GameHistoryScreen from './screens/GameHistoryScreen';
import StandingsScreen from './screens/StandingsScreen';
import ScheduleCreatorPlaceholder from './screens/ScheduleCreatorPlaceholder';
import MarkTeamAbsentScreen from './screens/MarkTeamAbsentScreen';
import CustomerAppDashboard from './screens/CustomerAppDashboard';
import VolleyballScreen from './screens/VolleyballScreen';
import SubmitScoresScreen from './screens/SubmitScoresScreen';
import CustomerAccountScreen from './screens/CustomerAccountScreen';
import CustomerAppEditorScreen from './screens/CustomerAppEditorScreen';
import LeagueSettingsScreen from './screens/LeagueSettingsScreen';
import ViewScheduleScreen from './screens/ViewScheduleScreen';
import RegisterTeamLink from './screens/RegisterTeamLink';
import UploadHighlightScreen from './screens/UploadHighlightScreen';
import PrintVolleyballSchedulesScreen from './screens/PrintVolleyballSchedulesScreen';
import HomeScreenEditor from './screens/HomeScreenEditor';
import EmployeeCreatorScreen from './screens/EmployeeCreatorScreen';
import EventsCalendarScreen from './screens/EventsCalendarScreen';
import UploadEventsCalendarScreen from './screens/UploadEventsCalendarScreen';
import EventsDashboardScreen from './screens/EventsDashboardScreen';
import ViewExistingEvents from './screens/ViewExistingEvents';
import VolleyballCarouselEditorScreen from './screens/VolleyballCarouselEditorScreen';
import ViewBannerHistoryScreen from './screens/ViewBannerHistoryScreen';
import HomeCarouselEditorScreen from './screens/HomeCarouselEditorScreen';
import CreatePostsScreen from './screens/CreatePostsScreen';
import ViewExistingPosts from './screens/ViewExistingPosts';
import SystemSettings from './screens/SystemSettings';
import TicketManagerScreen from './screens/Ticket-Module/TicketManagerScreen';
import TicketCreateScreen from './screens/Ticket-Module/TicketCreateScreen';
import TicketListScreen from './screens/Ticket-Module/TicketListScreen';
import TicketScanScreen from './screens/Ticket-Module/TicketScanScreen';
import TicketScanHistoryScreen from './screens/Ticket-Module/TicketScanHistoryScreen';
import ManualTicketEntry from './screens/Ticket-Module/ManualTicketEntry';
import TicketTypeScreen from './screens/Ticket-Module/TicketTypeScreen';
import CheckEngine from './screens/CheckEngine';
import StylingTestScreen from './screens/StylingTestScreen';
import ViewPostedSchedules from './screens/ViewPostedSchedules';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="CustomerLogin" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
            <Stack.Screen name="EmployeeLogin" component={EmployeeLoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboardScreen} />
            <Stack.Screen name="LeaguesDashboard" component={LeaguesDashboardScreen} />
            <Stack.Screen name="VolleyballLeague" component={VolleyballLeagueScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ScoreManagement" component={ScoreManagementScreen} />
            <Stack.Screen name="ScheduleCreator" component={ScheduleCreatorScreen} />
            <Stack.Screen name="AbsenceManagement" component={AbsenceManagementScreen} />
            <Stack.Screen name="TeamMaintenance" component={TeamMaintenanceScreen} />
            <Stack.Screen name="CreateTeamScreen" component={CreateTeamScreen} />
            <Stack.Screen name="EditTeamScreen" component={EditTeamScreen} />
            <Stack.Screen name="CaptainLogin" component={CaptainLoginScreen} />
            <Stack.Screen name="CaptainDashboard" component={CaptainDashboardScreen} />
            <Stack.Screen name="PlayerManagement" component={PlayerManagementScreen} />
            <Stack.Screen name="WaiverLink" component={WaiverLinkScreen} />
            <Stack.Screen name="GameDayBannerScreen" component={GameDayBannerScreen} />
            <Stack.Screen name="GameHistory" component={GameHistoryScreen} />
            <Stack.Screen name="Standings" component={StandingsScreen} />
            <Stack.Screen name="ScheduleCreatorPlaceholder" component={ScheduleCreatorPlaceholder} />
            <Stack.Screen name="MarkTeamAbsent" component={MarkTeamAbsentScreen} />
            <Stack.Screen name="CustomerAppDashboard" component={CustomerAppDashboard} />
            <Stack.Screen name="Volleyball" component={VolleyballScreen} />
            <Stack.Screen name="SubmitScores" component={SubmitScoresScreen} />
            <Stack.Screen name="CustomerAccountScreen" component={CustomerAccountScreen} />
            <Stack.Screen name="CustomerAppEditor" component={CustomerAppEditorScreen} />
            <Stack.Screen name="LeagueSettings" component={LeagueSettingsScreen} />
            <Stack.Screen name="ViewSchedule" component={ViewScheduleScreen} />
            <Stack.Screen name="RegisterTeamLink" component={RegisterTeamLink} />
            <Stack.Screen
              name="UploadHighlightScreen"
              component={UploadHighlightScreen}
            />
            <Stack.Screen name="PrintVolleyballSchedules" component={PrintVolleyballSchedulesScreen} />
            <Stack.Screen name="HomeScreenEditor" component={HomeScreenEditor} />
            <Stack.Screen name="EmployeeCreator" component={EmployeeCreatorScreen} />
            <Stack.Screen name="EventsCalendarScreen" component={EventsCalendarScreen} />
            <Stack.Screen
              name="UploadEventsCalendarScreen"
              component={UploadEventsCalendarScreen}
            />
            <Stack.Screen name="EventsDashboardScreen" component={EventsDashboardScreen} />
            <Stack.Screen name="ViewExistingEvents" component={ViewExistingEvents} />
            <Stack.Screen
              name="VolleyballCarouselEditorScreen"
              component={VolleyballCarouselEditorScreen}
            />
            <Stack.Screen name="ViewBannerHistoryScreen" component={ViewBannerHistoryScreen} />
            <Stack.Screen name="HomeCarouselEditorScreen" component={HomeCarouselEditorScreen} />
            <Stack.Screen name="CreatePostsScreen" component={CreatePostsScreen} />
            <Stack.Screen name="ViewExistingPosts" component={ViewExistingPosts} />
            <Stack.Screen name="SystemSettings" component={SystemSettings} />
            <Stack.Screen name="TicketManagerScreen" component={TicketManagerScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TicketCreateScreen" component={TicketCreateScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TicketListScreen" component={TicketListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TicketScanScreen" component={TicketScanScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TicketScanHistoryScreen" component={TicketScanHistoryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ManualTicketEntry" component={ManualTicketEntry} />
            <Stack.Screen name="TicketTypeScreen" component={TicketTypeScreen} />
            <Stack.Screen name="CheckEngine" component={CheckEngine} />
            <Stack.Screen name="StylingTestScreen" component={StylingTestScreen} />
            <Stack.Screen name="ViewPostedSchedules" component={ViewPostedSchedules} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
