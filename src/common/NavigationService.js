import { createNavigationContainerRef, StackActions } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
    }
}

export function pop(count = 1) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.pop(count));
    }
}

export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
}

export function push(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.push(name, params));
    }
}

export function reset() {
    if (navigationRef.isReady()) {
        navigationRef.reset({
            index: 0,
            routes: [
                { name: 'WelcomeNavigator' }
            ],
        });
    }
}

export function replace(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.replace(name, params));
    }
}