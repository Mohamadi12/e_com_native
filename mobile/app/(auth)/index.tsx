import UseSocialAuth from "@/hooks/useSocialAuth";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

const AuthScreen = () => {
  const { loadingStrategy, handleSocialAuth } = UseSocialAuth();

  return (
    <View className="px-8 flex-1 justify-center items-center bg-white">
      {/* DEMO IMAGE */}
      <Image
        source={require("@/assets/images/auth-image.png")}
        className="size-96"
        resizeMode="contain"
      />

      <View className="gap-2 mt-3">
        {/* GOOGLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-2"
          onPress={() => handleSocialAuth("oauth_google")}
          disabled={loadingStrategy !== null}
          style={{
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            elevation: 2, // this is for android (pour android)
          }}
        >
          {loadingStrategy === "oauth_google" ? (
            <ActivityIndicator size={"small"} color={"#4285f4"} />
          ) : (
            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/images/google.png")}
                className="size-10 mr-3"
                resizeMode="contain"
              />
              <Text className="text-black font-medium text-base">
                Continuer avec Google
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* APPLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-3"
          onPress={() => handleSocialAuth("oauth_apple")}
          disabled={loadingStrategy !== null}
          style={{
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            elevation: 2, // this is for android
          }}
        >
          {loadingStrategy === "oauth_apple" ? (
            <ActivityIndicator size={"small"} color={"#4285f4"} />
          ) : (
            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/images/apple.png")}
                className="size-8 mr-3"
                resizeMode="contain"
              />
              <Text className="text-black font-medium text-base">
                Continuer avec Apple
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text className="text-center text-gray-500 text-xs leading-4 mt-6 px-2">
        En vous inscrivant, vous acceptez nos{" "}
        <Text className="text-blue-500">Conditions</Text>
        {", "}
        <Text className="text-blue-500">Politique de confidentialité</Text>
        {", and "}
        <Text className="text-blue-500">Utilisation des cookies</Text>
      </Text>
    </View>
  );
};

export default AuthScreen;
