/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

//import NotificationInitialize from '../Helpers/Initialize';
import DemoNotificationService from '../Helpers/DemoNotificationService';
import DemoNotificationRegistrationService from '../Helpers/DemoNotificationRegistrationService';

export default class Notifications extends Component {
  notificationService: DemoNotificationService;
  notificationRegistrationService: DemoNotificationRegistrationService;
  deviceId: string;

  constructor() {
    super();
    console.log('constructor called yay1');
    this.state = {
      status: 'Push notifications registration status is unknown',
      registeredOS: '',
      registeredToken: '',
      isRegistered: false,
      isBusy: false,
    };

    this.notificationService = new DemoNotificationService(
      this.onTokenReceived.bind(this),
      this.onNotificationReceived.bind(this),
    );

    this.notificationRegistrationService =
      new DemoNotificationRegistrationService(
        'http://10.0.2.2:3000',
        'Config.apiKey',
      );
  }

  onTokenReceived(token: any) {
    console.log(`Received a notification token on ${token.os}`);
    console.log(this.state);

    this.setState({
      registeredToken: token.token,
      registeredOS: token.os,
      status: `The push notifications token has been received.`,
    });

    if (
      this.state.isRegistered &&
      this.state.registeredToken &&
      this.state.registeredOS
    ) {
      this.onRegisterButtonPress();
    }
  }

  onNotificationReceived(notification: any) {
    console.log(`Received a push notification on ${this.state.registeredOS}`);
    this.setState({status: `Received a push notification...`});

    if (notification.data.message) {
      // console.log(
      //   AppConfig.appName,
      //   `${notification.data.action} action received`,
      // );
      // window.alert(
      //   AppConfig.appName,
      //   `${notification.data.action} action received`,
      // );
    }
  }
  onRegisterButtonPress() {
    console.log('onRegisterButtonPress: ', this.state);
    if (!this.state.registeredToken || !this.state.registeredOS) {
      console.log("The push notifications token wasn't received.");
      return;
    }
    let status: string = 'Registering...';
    let isRegistered = this.state.isRegistered;
    try {
      this.setState({isBusy: true, status});
      const pnPlatform = this.state.registeredOS == 'ios' ? 'apns' : 'fcm';
      const pnToken = this.state.registeredToken;
      const request = {
        installationId: this.deviceId,
        platform: pnPlatform,
        pushChannel: pnToken,
        tags: [],
      };
      this.notificationRegistrationService
        .registerAsync(request)
        .then(response => {
          console.log('IDK Done Register: ', response);
          status = `Registered for ${this.state.registeredOS} push notifications`;
          isRegistered = true;
        });
    } catch (e) {
      status = `Registration failed: ${e}`;
    } finally {
      this.setState({isBusy: false, status, isRegistered});
    }
  }

  onDeregisterButtonPress() {
    console.log('onDeregisterButtonPress: ', this.state);

    if (!this.notificationService) return;

    let status: string = 'Deregistering...';
    let isRegistered = this.state.isRegistered;
    try {
      this.setState({isBusy: true, status});
      //await this.notificationRegistrationService.deregisterAsync(this.deviceId);
      status = 'Deregistered from push notifications';
      isRegistered = false;
    } catch (e) {
      status = `Deregistration failed: ${e}`;
    } finally {
      this.setState({isBusy: false, status, isRegistered});
    }
  }

  getMessagesPress() {
    console.log('getMessagesPress: ');

    try {
      this.notificationRegistrationService.getMessages().then(response => {
        console.log('IDK Done Register: ', response);
        //let status = response;
        console.log(response);
        //isRegistered = true;
      });
    } catch (e) {
      //status = `Registration failed: ${e}`;
    } finally {
      // this.setState({isBusy: false, status, isRegistered});
    }
  }

  render() {
    return (
      <View>
        <Text style={styles.textDisplay}>Hello There</Text>
        <View style={styles.button}>
          <Button
            title="Register"
            onPress={() => this.onRegisterButtonPress()}
            style={styles.button}
            disabled={this.state.isBusy}>
            <Text>Register</Text>
          </Button>
        </View>
        <View style={styles.button}>
          <Button
            title="Deregister"
            onPress={() => this.onDeregisterButtonPress()}
            disabled={this.state.isBusy}>
            <Text>Deregister</Text>
          </Button>
        </View>

        <View style={styles.button}>
          <Button
            title="Get Messages"
            onPress={() => this.getMessagesPress()}
            disabled={this.state.isBusy}>
            <Text>Get Messages</Text>
          </Button>
        </View>
        <Text></Text>
        <View>
          <Text id="resultsArea">Results Here</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textDisplay: {
    padding: 10,
    margin: 5,
    fontSize: 32,
    backgroundColor: 'aqua',
  },
  button: {
    margin: 5,
    width: '100%',
  },
});
