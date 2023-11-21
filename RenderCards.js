import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import CountryFlag from 'react-native-country-flag'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import imagesPath from '../constants/imagesPath'

import colors from '../styles/colors'
import commonStyles from '../styles/commonStyles'
import { height, moderateScale, width } from '../styles/responsiveSize'
import { ShowGender } from '../utils/helperFunctions'

export const DURATION = 600
export const CARD_HEIGHT = height / 2.85
export const CARD_WIDTH = width / 2.35

const RenderCards = ({
  temp,
  length,
  item,
  index,
  selectedCardValue,
  name,
  age,
  occupation,
  disabledTouchFromChild = () => { }
}) => {
  const rotate = useSharedValue('0deg')
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const scaleY = useSharedValue(1)
  const scale = useSharedValue(1)
  const selectedCardOpacity = useSharedValue(1)

  const [selectedIndex, setSelectedIndex] = useState(length)
  const [touchDisabled, setTouchDisabled] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  useEffect(() => {
    // if(Platform.OS=="ios"){
    if (temp === true) {
      const _rotate = `${index + '0'}deg`
      const _translateX = index * 30

      rotate.value = withTiming(_rotate, { duration: 50 })
      translateX.value = withTiming(_translateX, { duration: 50 })
      translateY.value = withTiming(
        index === 0
          ? -index * 1
          : index === length - 1
            ? index + 1 * 18
            : -index + 1 * 18,
        { duration: 50 }
      )
      return
    }
    // }

    const _rotate = `${index + '0'}deg`
    const _translateX = index * 30

    rotate.value = withTiming(_rotate, { duration: DURATION * 2.5 })
    translateX.value = withTiming(_translateX, { duration: DURATION * 2.5 })
    translateY.value = withTiming(
      index === 0
        ? -index * 1
        : index === length - 1
          ? index + 1 * 18
          : -index + 1 * 18,
      { duration: DURATION * 2.5 }
    )
  }, [])

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: rotate.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scaleY: scaleY.value },
        { scale: scale.value }
      ],
      opacity: selectedCardOpacity.value
    }
  })

  // useEffect(() => {
  //   if (touchDisabled) {
  //     _onTouch(selectedCard?.item, selectedCard?.index);
  //   }
  // }, [touchDisabled]);

  const onClickCard = value => {
    disabledTouchFromChild(true)
    _onTouch(value?.item, value?.index)
  }

  const _onTouch = (item, index) => {
    if (index == length - 1) {
      return
    }

    const _translateX = 30
    rotate.value = withTiming(`${20}deg`, { duration: DURATION })
    translateY.value = withTiming(-200, { duration: DURATION })
    scaleY.value = withTiming(-1, { duration: DURATION })
    translateX.value = withTiming(_translateX, { duration: DURATION })
    setTimeout(() => {
      setSelectedIndex(index)
      setTimeout(() => {
        console.log(item, 'Selected Item')
        selectedCardValue(item)
      }, 1000)
      translateY.value = withTiming(index + 0, { duration: DURATION })
      scaleY.value = withTiming(1, { duration: DURATION })
      scale.value = withTiming(1.5, { duration: DURATION })
    }, 600)
  }

  const _onPressCard = () => {
    setTouchDisabled(true)
    const _obj = {
      item,
      index
    }
    setSelectedCard(_obj)
    onClickCard(_obj)
  }

  return (
    <Animated.View
      key={item + index.toString()}
      style={[
        {
          ...styles.mainView,
          zIndex: index == selectedIndex ? 9999 : 0
        },
        rStyle
      ]}>
      <TouchableOpacity
        style={styles.touchViewStyle}
        activeOpacity={1}
        onPress={() => item?.id != -696969 && _onPressCard()}
        disabled={touchDisabled}>
        <ImageBackground
          source={
            item?.id == -696969
              ? imagesPath.ic_splash_royo_dating
              : {
                uri:
                  String(item?.profile_image_thumb || item?.profile_image) ||
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKHrh-Aj4tueSYxcy5BezN1YEDn0B46tRlVA&usqp=CAU'
              }
          }
          style={styles.cardImage}>
          {/* {item?.id != -696969 && <View style={{
            position: "absolute",
            right: moderateScale(8),
            top: moderateScale(8),
          }}>
            {ShowGender(item?.gender)}
          </View>} */}
          {item?.id != -696969 && (
            <View style={styles.cardSubView}>
              <View style={styles.nameFlagView}>
                <Text style={styles.nameAge} numberOfLines={2}>
                  {name + ',' + age}
                </Text>
                <CountryFlag
                  isoCode={item?.country_flag || 'GB'}
                  size={moderateScale(14)}
                />
              </View>
              <Text style={styles.occupationText} numberOfLines={2}>
                {occupation}
              </Text>
            </View>
          )}
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  mainView: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    position: 'absolute',
    borderRadius: moderateScale(12)
  },
  touchViewStyle: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardImage: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    borderWidth: 0.3,
    borderColor: colors.borderGrey,
    justifyContent: 'flex-end',
    backgroundColor: colors.whiteOpacity40
  },
  cardSubView: {
    padding: moderateScale(10),
    backgroundColor: colors.blackOpacity15
  },
  nameFlagView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between'
  },
  nameAge: {
    ...commonStyles.font_14_bold,
    color: colors.white,
    width: '80%',
    paddingEnd: moderateScale(6)
  },
  occupationText: {
    ...commonStyles.font_12_medium,
    color: colors.white,
    lineHeight: moderateScale(24)
  }
})

export default React.memo(RenderCards)
