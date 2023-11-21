import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import HomeButtons from '../../Components/HomeButtons'
import imagesPath from '../../constants/imagesPath'
import colors from '../../styles/colors'
import commonStyles from '../../styles/commonStyles'
import { moderateScale } from '../../styles/responsiveSize'

const RenderJackQueenButtons = ({
  onPressJack,
  onPressQueen,
  onPressFriend
}) => {
  return (
    <View style={styles.mainView}>

      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          height: moderateScale(90),
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onPressJack}
      >
        <Image
          source={imagesPath.ic_reject_card}
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          height: moderateScale(90),
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onPressQueen}
      >
        <Image
          source={imagesPath.ic_like_card}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  mainView: {
    alignSelf: "center",
    alignItems: 'center',
    // flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: "80%"
  }
})

export default React.memo(RenderJackQueenButtons)
