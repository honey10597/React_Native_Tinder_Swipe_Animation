import React, { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import FastImage from 'react-native-fast-image';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import imagesPath from '../../constants/imagesPath';
import colors from '../../styles/colors';
import commonStyles from "../../styles/commonStyles";
import { height, moderateScale, width } from '../../styles/responsiveSize';
import LinearGradient from 'react-native-linear-gradient';
import { InitAnimation } from '../../utils/helperFunctions';

InitAnimation()

interface TinderViewInterface {
    itemData?: any
    indexData?: any
    gestureHandler?: any
    cardAnimationStyle?: any
    likeStyleAnimation?: any
    dislikeStyleAnimation?: any
    onPressView?: any
    OnReject?: any
    OnAccept?: any
}

const TinderView: FC<TinderViewInterface> = ({
    itemData,
    indexData,
    gestureHandler,
    cardAnimationStyle,
    likeStyleAnimation,
    dislikeStyleAnimation,
    onPressView,
    OnReject,
    OnAccept
}) => {
    return (
        indexData === 0 ?
            <PanGestureHandler
                onGestureEvent={gestureHandler}
            >
                <Animated.View
                    style={[{ ...styles.mainComp }, cardAnimationStyle]}
                >
                    <FastImage
                        source={{ uri: itemData?.profile_image }}
                        style={styles.profilePic}
                    />

                    <LinearGradient
                        colors={[colors.blackOpacity50, colors.blackOpacity80]}
                        style={{
                            position: "absolute",
                            width: "100%",
                            padding: moderateScale(16),
                            bottom: 0,
                        }}
                        start={{ x: 0.5, y: 0.9 }}
                        end={{ x: 0.6, y: 1 }}
                    >
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                            activeOpacity={0.9}
                            onPress={onPressView}
                        >
                            <Text style={{
                                ...styles.nameText
                            }}
                                numberOfLines={3}>{itemData?.first_name + ", " + itemData?.age}
                                <Text style={{
                                    ...styles.occupationText
                                }}

                                >{"\n" + itemData?.occupation}</Text>
                            </Text>

                            <CountryFlag
                                isoCode={itemData?.country_flag || 'GB'}
                                size={moderateScale(20)}
                            />
                        </TouchableOpacity>
                        <View style={{
                            marginTop: moderateScale(6),
                            flexDirection: "row", justifyContent: "space-around"
                        }}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={OnReject}
                            >
                                <Image
                                    source={imagesPath.ic_reject_card}
                                    style={{
                                        height: moderateScale(50),
                                        width: moderateScale(50),
                                    }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={OnAccept}
                            >
                                <Image
                                    source={imagesPath.ic_like_card}
                                    style={{
                                        height: moderateScale(50),
                                        width: moderateScale(50),
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                    <Animated.Image
                        source={imagesPath.ic_like_card}
                        style={[
                            { ...styles.likeCard }, likeStyleAnimation]}
                        resizeMode="contain"
                    />

                    <Animated.Image
                        source={imagesPath.ic_reject_card}
                        style={[
                            { ...styles.dislikecard },
                            dislikeStyleAnimation
                        ]}
                        resizeMode="contain"
                    />

                </Animated.View>
            </PanGestureHandler >
            :
            <View style={{ ...styles.mainComp }}>
                <FastImage
                    source={{ uri: itemData?.profile_image }}
                    style={styles.profilePic}
                />
                <TouchableOpacity
                    style={{
                        backgroundColor: colors.blackOpacity50,
                        position: "absolute",
                        width: "100%",
                        padding: moderateScale(16),
                        bottom: 0,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                        activeOpacity={0.9}
                        onPress={onPressView}
                    >
                        <Text style={{
                            ...styles.nameText
                        }}>{itemData?.first_name + ", " + itemData?.age}
                            <Text style={{
                                ...styles.occupationText
                            }}>{"\n" + itemData?.occupation}</Text>
                        </Text>

                        <CountryFlag
                            isoCode={itemData?.country_flag || 'GB'}
                            size={moderateScale(20)}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
    )
}

const styles = StyleSheet.create({
    mainComp: {
        width: width - moderateScale(20),
        height: height / 1.36,
        alignSelf: "center",
        position: "absolute",
        backgroundColor: colors.black,
        borderRadius: moderateScale(16),
        overflow: "hidden"
    },
    profilePic: {
        width: "100%",
        height: "100%"
    },
    likeCard: {
        width: moderateScale(100),
        height: moderateScale(100),
        position: 'absolute',
        alignSelf: "flex-start",
        start: moderateScale(32),
        top: moderateScale(32),
        zIndex: 1,
        elevation: 1,
    },
    dislikecard: {
        width: moderateScale(100),
        height: moderateScale(100),
        position: 'absolute',
        alignSelf: "flex-end",
        end: moderateScale(32),
        top: moderateScale(32),
        zIndex: 1,
        elevation: 1,
    },
    linearGradientView: {
        width: "100%",
        height: "100%",
        borderRadius: moderateScale(10),
        position: "absolute",
        bottom: moderateScale(20),
        left: moderateScale(0),
    },
    nameText: {
        ...commonStyles.font_22_bold,
        color: colors.white,
        width: "80%"
    },
    occupationText: {
        ...commonStyles.font_16_medium,
        color: colors.white,
        width: "80%"
    },
})

export default React.memo(TinderView);
