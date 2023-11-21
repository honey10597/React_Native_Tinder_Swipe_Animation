import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native'
import CountryFlag from 'react-native-country-flag'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Modal from 'react-native-modal'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { useSelector } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'

import BannerComp from '../../Components/BannerComp'
import BonkerBonksFilter, {
  SetLocationFilter
} from '../../Components/BonkerBonksFilter'
import ButtonComp from '../../Components/ButtonComp'
import GradientText from '../../Components/GradientText'
import HomeHeader from '../../Components/HomeHeader'
import ListEmptyComponent from '../../Components/ListEmptyComponent'
import { Loader } from '../../Components/Loader'
import RenderCards, {
  CARD_HEIGHT,
  CARD_WIDTH
} from '../../Components/RenderCards'
import WrapperContainer from '../../Components/WrapperContainer'
import strings from '../../constants/Languages'
import imagesPath from '../../constants/imagesPath'
import navigationString from '../../constants/navigationString'
import {
  getCurrentVersion,
  getUserProfile
} from '../../redux/reduxActions/authActions'
import {
  getAdvertisementApi,
  likeAdvertisementApi,
  likeDislikeUserApi,
  matchUserListApi,
  saveTutorialStatus,
  setBonkersFiltersApi
} from '../../redux/reduxActions/homeActions'
import colors from '../../styles/colors'
import commonStyles, { hitSlopProp } from '../../styles/commonStyles'
import { height, moderateScale, width } from '../../styles/responsiveSize'
import {
  ApiError,
  ApplyEaseOutAnimation,
  InitAnimation,
  ShowGender,
  showError,
  showSuccess
} from '../../utils/helperFunctions'
import { checkLocationSevice } from '../../utils/miscellaneous'
import {
  BODY_TYPE,
  CHILDREN,
  CUISIN,
  DRINKING,
  EDUCATION,
  FAVOURITE_PLACE,
  FITNESS,
  GENDERS,
  HAIRS,
  HOBBIES,
  INK,
  INTERESTS,
  LANGUAGES,
  LIFE_STYLE,
  LOOKING_FOR,
  MAX_AGE,
  MIN_AGE,
  OCCUPATION,
  PERSONALITY,
  RELIGION,
  SEXUALITY,
  ZODIAC_SIGN
} from '../../utils/staticData'
import { ConnectingSocket } from '../../utils/utils'
import { BonkersFilterValidations } from '../../utils/validations'
import RenderJackQueenButtons from './HomeComponents'

InitAnimation()

const ROTATION = 60

const Home = (props) => {

  const { navigation } = props

  const userData = useSelector(state => state?.authReducers?.userData || {})
  const coords = useSelector(state => state?.authReducers?.coordinates || {})
  const showTutorial = useSelector(
    state => state.homeReducers?.showHomeTutorial
  )
  console.log(userData, 'userDatauserDatauserData')

  const [bannerModal, setBannerModal] = useState({
    isVisible: false,
    data: null,
    bannerImgLoad: true
  })
  const [isLoading, setLoading] = useState(true)
  const [cardRefresh, setCardRefresh] = useState(true)
  const [isPreferancesModalVisible, setIsPreferancesModalVisible] =
    useState(false)
  const [disabledTouch, setDisabledTouch] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [setUsersInCards, setStateUserInCards] = useState({
    status: false,
    type: null
  })
  const [allUsers, setAllUsers] = useState([])
  const [pageNo, setPageNo] = useState(3)
  const [cardsData, setCardsData] = useState([])
  const [selectedCardToSlide, setSelectedCardToSlide] = useState(null)
  const [showHand, setShowHand] = useState(false)
  const [coordinates, setCoordinates] = useState(
    {
      latitude:
        Number(userData?.filters?.lat) || Number(coords?.latitude) || 30.7191,
      latitudeDelta: 0.03276390890841441,
      longitude:
        Number(userData?.filters?.long) || Number(coords?.longitude) || 76.8103,
      longitudeDelta: 0.042099952697753906
    } || coords
  )
  const [selectedAddress, setSelectedAddress] = useState('')
  const focused = useIsFocused()
  const { width: screenWidth } = useWindowDimensions()

  const hiddenTranslateX = 2 * screenWidth
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const cardScale = useSharedValue(1.5)
  const rotate = useDerivedValue(
    () =>
      interpolate(translateX.value, [0, hiddenTranslateX], [0, ROTATION]) + 'deg'
  )

  // useEffect(() => {
  //   CheckLocationForSession()
  // }, [])

  const [showBonks, setShowBonks] = useState(false)

  useEffect(() => {
    getCurrentVersion()
      .then(res => {
        if (res?.data) {
          setShowBonks(res?.data?.enable_bonk_side == 2 ? false : true);
        } else {
          setShowBonks(false)
        }
      })
      .catch(err => {
        setShowBonks(false)
      })
  }, [])

  useEffect(() => {
    translateX.value = 0
    translateY.value = 0
  }, [translateX])

  const isFocused = useIsFocused()

  useEffect(() => {
    if (setUsersInCards?.status === true || isFocused) {
      getUserProfile()
    }
  }, [setUsersInCards, isFocused])

  useEffect(() => {
    _setFilterValues()
    _checkLocation()
    _getAdv()
    const unsubscribe = navigation.addListener('focus', () => {
      ConnectingSocket()
      _hitApiFromStart()
    })
    return unsubscribe;
  }, [])

  useEffect(() => {
    if (!showHand) {
      _handAnimation('_RESET')
    }
  }, [showHand])

  useEffect(() => {
    if (setUsersInCards?.status === true) {
      setTimeout(() => {
        // translateX.value = 0
        _hitLikeDislikeApi(
          setUsersInCards?.type === 'UP' || setUsersInCards?.type === 'FRIEND'
            ? 1
            : 3,
          selectedCardToSlide?.id,
          setUsersInCards?.type === 'FRIEND' ? 2 : 1
        )
        _setUsersToShow(allUsers, selectedCardToSlide?.id)
        setSelectedCardToSlide(null)
      }, 100)
    }
  }, [setUsersInCards])

  useLayoutEffect(() => {
    if (selectedCardToSlide) {
      setDisabledTouch(false)
    }
  }, [selectedCardToSlide])

  const _setFilterValues = () => {
    if (userData?.languages && userData?.languages.length > 0) {
      const lang = userData?.languages.map((val, ind) => {
        const obj = {
          id: val,
          name: LANGUAGES[val - 1],
          isSelected: true
        }
        return obj
      })
      setLangugaes(lang)
    }
    if (userData?.hobbies && userData?.hobbies.length > 0) {
      const hob = userData?.hobbies.map((val, ind) => {
        const obj = {
          id: val,
          name: HOBBIES[val - 1],
          isSelected: true
        }
        return obj
      })
      setHobies(hob)
    }
    if (userData?.favourite_place && userData?.favourite_place.length > 0) {
      const fv = userData?.favourite_place.map((val, ind) => {
        const obj = {
          id: val,
          name: FAVOURITE_PLACE[val - 1],
          isSelected: true
        }
        return obj
      })
      setFavPlaces(fv)
    }
    if (userData?.interests && userData?.interests.length > 0) {
      const it = userData?.interests.map((val, ind) => {
        const obj = {
          id: val,
          name: INTERESTS[val - 1],
          isSelected: true
        }
        return obj
      })
      setInterests(it)
    }
    if (userData?.cuisin && userData?.cuisin.length > 0) {
      const it = userData?.cuisin.map((val, ind) => {
        const obj = {
          id: val,
          name: CUISIN[val - 1],
          isSelected: true
        }
        return obj
      })
      setCuisin(it)
    }
  }

  const _checkLocation = () => {
    // checkLocationSevice().catch(() => {
    //   logoutApi()
    //   showError(strings.pleaseEnableLocationToContinue)
    // })
    showBonks && checkLocationSevice()
  }

  const _getAdv = () => {
    getAdvertisementApi()
      .then(res => {
        if (res?.data != null) {
          setBannerModal(prevBanner => ({
            ...prevBanner,
            isVisible: true,
            data: res?.data
          }))
        }
      })
      .catch(error => { })
  }

  const _hitApiFromStart = () => {
    _handAnimation('_RESET')
    setCardRefresh(true)
    setSelectedCardToSlide(null)
    setDisabledTouch(false)
    setHasMoreData(true)
    setStateUserInCards({ status: false, type: null })
    setAllUsers([])
    setPageNo(1)
    setCardsData([])
    setLoading(true)
    _getAllUsers(1, -1)
  }

  const _getAllUsers = (pgNo, _id) => {
    const apiData = {
      pageNo: pgNo
    }

    matchUserListApi(apiData)
      .then(res => {
        console.log(res?.data, 'matchUserListApi res')

        setShowHand(true)

        setLoading(false)
        setCardRefresh(false)

        const _bonkersFirstPic = {
          id: -696969,
          profile_image: imagesPath.bonkers_main,
          full_name: '',
          occupation: '',
          age: 0
        }
        const _users = res?.data?.data

        if (_users.length === 0) {
          setShowHand(false)
          return setHasMoreData(false)
        }

        if (pgNo === 1) {
          const _first4 = _users.filter((vak, ind) => ind < 3)
          const _restAllUsers = _users.filter((vak, ind) => ind >= 3)
          setAllUsers(_restAllUsers)
          setCardsData([..._first4, _bonkersFirstPic])
        } else {
          _setUsersToShow(res?.data?.data, _id)
        }
        setStateUserInCards({ status: false, type: null })
        setHasMoreData(true)
        _handAnimation('_APPLY')
      })
      .catch(error => {
        setShowHand(false)
        setLoading(false)
        setHasMoreData(true)
        setCardRefresh(false)
        setStateUserInCards({ status: false, type: null })
      })
  }

  const _setUsersToShow = (_users = allUsers, _id = 1) => {
    console.log(_users, '_users 111111, cardsData')

    if (_users.length === 0 && hasMoreData === true) {
      setPageNo(pageNo + 1)
      _getAllUsers(pageNo + 1, _id)
      return
    }

    const _firstUser = _users.filter((val, ind) => ind < 1)
    const _restAllUsers = _users.filter((val, ind) => ind >= 1)
    const _holdCards = cardsData.filter((item, index) => item?.id !== _id)
    const _newUsers = [..._firstUser, ..._holdCards]

    setAllUsers(_restAllUsers)
    setCardsData(_newUsers)
    setLoading(false)
    setStateUserInCards({ status: false, type: null })
    _handAnimation('_APPLY')
  }

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: rotate.value },
      { scale: cardScale.value },
      { translateY: translateY.value },
      { translateX: translateX.value }
    ]
  }))

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, hiddenTranslateX / 5], [0, 1]),
    // opacity: interpolate(translateY.value, [0, hiddenTranslateX / 5], [0, 1])
  }))

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -hiddenTranslateX / 5], [0, 1]),
    // opacity: interpolate(translateY.value, [0, -hiddenTranslateX / 5], [0, 1])
  }))

  const onSwipeUp = val => {
    setTimeout(() => {
      setStateUserInCards({ status: true, type: 'UP' })
    }, 0)
    setTimeout(() => {
      translateX.value = withSpring(0)
    }, 700);
  }

  const onSwipeDown = val => {
    setTimeout(() => {
      setStateUserInCards({ status: true, type: 'DOWN' })
    }, 0)
    setTimeout(() => {
      translateX.value = withSpring(0)
    }, 700);
  }

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value
      // context.startY = translateY.value
    },
    onActive: (event, context) => {


      // if (event?.translationX > 0) {
      translateX.value = context.startX + event.translationX
      // }
      // translateY.value = context.startY + event.translationY
    },
    onEnd: event => {
      console.log(event, 'eventeventeventeventeventevent')

      if (Math.abs(event.translationX) < 150) {
        translateX.value = withSpring(0)
        return
      }
      // const toLeft = Math.sign(event.translationX)

      // if (Math.abs(event.translationY) < 180) {
      //   translateY.value = withSpring(0)
      //   translateX.value = withSpring(0)
      //   return
      // }

      const toLeft = Math.sign(event.translationX)

      if (toLeft === -1) {
        console.log('111111111')
        try {
          runOnJS(onSwipeDown)('')
        } catch (error) {
          showError(error)
        }
      } else {
        console.log('222222')
        try {
          runOnJS(onSwipeUp)('')
        } catch (error) {
          showError(error)
        }
      }
    }
  })

  const _hitLikeDislikeApi = (type, toUserId, matchType) => {
    setShowHand(true)
    const apiData = {
      status: type,
      // from_user: userData?.id,
      user_id: toUserId || '-1',
      request_type: matchType
    }
    console.log(apiData, 'lkasdjlkadsjalksdjlk')
    likeDislikeUserApi(apiData)
      .then(res => {
        console.log(res, '_hitLikeDislikeApi res')
      })
      .catch(error => {
        showError(ApiError(error))
        console.log(error, '_hitLikeDislikeApi error')
      })
  }

  const _onLikeCard = () => {
    translateX.value = withTiming(hiddenTranslateX, { duration: 700 })
    setTimeout(() => {
      setStateUserInCards({ status: true, type: 'UP' })
    }, 500)
    setTimeout(() => {
      translateX.value = withSpring(0)
    }, 700);
  }

  const _onFriendCard = () => {
    translateX.value = withTiming(-hiddenTranslateX, { duration: 700 })
    setTimeout(() => {
      setStateUserInCards({ status: true, type: 'FRIEND' })
    }, 500)
    setTimeout(() => {
      translateX.value = withSpring(0)
    }, 700);
  }

  const _onDislikeCard = () => {
    translateX.value = withTiming(-hiddenTranslateX, { duration: 700 })
    setTimeout(() => {
      setStateUserInCards({ status: true, type: 'DOWN' })
    }, 500)
    setTimeout(() => {
      translateX.value = withSpring(0)
    }, 700);
  }

  /// ////////////////// ******** ****** /\/\/\/\/\/\ ****** ***** ***** ////////////////////////////

  const [age, setAge] = useState([
    userData?.filters?.from_age || MIN_AGE,
    userData?.filters?.to_age || MAX_AGE
  ])
  const [maxHeight, setMaxHeight] = useState(
    userData?.filters?.maximum_height || 60
  )
  const [weight, setWeight] = useState(userData?.filters?.weight || 50)
  const [bodyTypeValue, setBodyTypeValue] = useState({
    name: userData?.filters?.body_type || BODY_TYPE[0]
  })
  const [preferredGenderValue, setPreferredGenderValue] = useState({
    id: userData?.filters?.interested_in || 1,
    name: GENDERS[userData?.filters?.interested_in - 1 || 1],
    isSelected: true
  })
  const [smokersValue, setSmokersValue] = useState(
    userData?.filters?.is_smoker === 1 ? true : false || false
  )
  const [sexualityValue, setSexualityValue] = useState({
    id: userData?.filters?.sexuality || 1,
    name: SEXUALITY[userData?.filters?.sexuality - 1 || 0],
    isSelected: true
  })
  const [tribesValue, setTribesValue] = useState({
    name: userData?.filters?.tribes || SEXUALITY[1]
  })
  const [hairValue, setHairValue] = useState({
    name: userData?.filters?.hair || HAIRS[0]
  })
  const [piercingValue, setPiercingValue] = useState(
    userData?.filters?.piercing === 1 ? true : false || false
  )
  const [maxDistance, setMaxDistance] = useState(
    userData?.filters?.distance || '0'
  )
  const [bedRoomAnticsValue, setBedRoomAnticsValue] = useState({
    id: userData?.filters?.bedroom_antics || 1,
    name: SEXUALITY[userData?.filters?.bedroom_antics - 1 || 0],
    isSelected: true
  })

  const [ink, setInk] = useState({
    name: userData?.filters?.ink || INK[0]
  })
  const [education, setEducation] = useState({
    name: userData?.filters?.education || EDUCATION[0]
  })
  const [occupation, setOccupation] = useState({
    name: userData?.filters?.occupation || OCCUPATION[0]
  })
  const [children, setChildren] = useState({
    name: userData?.filters?.children || CHILDREN[0]
  })
  const [pets, setPets] = useState(userData?.filters?.pets === 1 ? 1 : 0)
  const [religion, setReligion] = useState({
    name: userData?.filters?.religion || RELIGION[0]
  })
  const [foodie, setFoodie] = useState(
    userData?.filters?.foodie === 1 ? true : false || false
  )
  const [drinking, setDrinking] = useState({
    id: 1,
    name: DRINKING[0],
    isSelected: true
  })
  const [fitness, setFitness] = useState({
    id: 1,
    name: FITNESS[0],
    isSelected: true
  })
  const [lifestyle, setLifeStyle] = useState({
    id: 1,
    name: LIFE_STYLE[0],
    isSelected: true
  })
  const [drivingLicense, setDrivingLicense] = useState(
    userData?.filters?.driving_license === 1 ? true : false || false
  )
  const [personality, setPersonality] = useState({
    id: 1,
    name: PERSONALITY[0],
    isSelected: true
  })
  const [languages, setLangugaes] = useState([])
  const [hobies, setHobies] = useState([])
  const [favPlaces, setFavPlaces] = useState([])
  const [interests, setInterests] = useState([])
  const [cuisin, setCuisin] = useState([])
  const [isSmoker, setIsSmoker] = useState(userData?.filters?.is_smoker === 1)
  const [starSign, setStarSign] = useState({
    id: 1,
    name: ZODIAC_SIGN[0]
  })

  const indexTwoView = () => {
    return (
      <BonkerBonksFilter
        preferredGenderValue={preferredGenderValue}
        setPreferredGenderValue={val => setPreferredGenderValue(val)}
        maxDistance={maxDistance}
        setMaxDistance={val => setMaxDistance(val)}
        age={age}
        setAge={val => setAge(val)}
        maxHeight={maxHeight}
        setMaxHeight={
          // userData?.subscription?.subscription_id > 1
          //   ? val => setMaxHeight(val)
          //   : null
          val => setMaxHeight(val)
        }
        // ink={ink}
        // setInk={(val) => setInk(val)}
        // education={education}
        // setEducation={(val) => setEducation(val)}
        // occupation={occupation}
        // setOccupation={(val) => setOccupation(val)}
        // children={children}
        // setChildren={(val) => setChildren(val)}
        // pets={pets}
        // setPets={(val) => setPets(val)}
        religion={userData?.subscription?.subscription_id > 1 ? religion : null}
        setReligion={val => setReligion(val)}
        // smokersValue={smokersValue}
        // setSmokersValue={val => setSmokersValue(val)}
        // foodie={foodie}
        // setFoodie={(val) => setFoodie(val)}
        // drinking={drinking}
        // setDrinking={(val) => setDrinking(val)}
        // fitness={fitness}
        // setFitness={(val) => setFitness(val)}
        // lifestyle={lifestyle}
        // setLifeStyle={(val) => setLifeStyle(val)}
        // drivingLicense={drivingLicense}
        // setDrivingLicense={(val) => setDrivingLicense(val)}
        // personality={personality}
        // setPersonality={(val) => setPersonality(val)}
        // languages={languages}
        // setLanguages={(val) => setLangugaes(val)}
        // hobies={hobies}
        // setHobies={(val) => setHobies(val)}
        // favPlaces={favPlaces}
        // setFavPlaces={(val) => setFavPlaces(val)}
        // interests={interests}
        // setInterests={(val) => setInterests(val)}
        // cuisin={cuisin}
        // setCuisin={setCuisin}
        // // piercingValue={piercingValue}
        // // setPiercingValue={val => setPiercingValue(val)}
        sexualityValue={showBonks && sexualityValue}
        setSexualityValue={
          showBonks && userData?.subscription?.subscription_id > 1
            ? val => setSexualityValue(val)
            : null
        }
      // isSmoker={isSmoker}
      // setIsSmoker={(val) => setIsSmoker(val)}
      // starSign={starSign}
      // setStarSign={(val) => setStarSign(val)}

      // weight={weight}
      // setWeight={val => setWeight(val)}
      // bodyTypeValue={bodyTypeValue}
      // setBodyTypeValue={val => setBodyTypeValue(val)}

      // tribesValue={tribesValue}
      // setTribesValue={val => setTribesValue(val)}
      // hairValue={hairValue}
      // setHairValue={val => setHairValue(val)}
      // bedRoomAnticsValue={bedRoomAnticsValue}
      // setBedRoomAnticsValue={val => setBedRoomAnticsValue(val)}
      />
    )
  }

  const _validations = () => {
    if (
      !BonkersFilterValidations(
        maxHeight,
        preferredGenderValue,
        sexualityValue,
        // ink,
        // education,
        // occupation,
        // children,
        religion
        // drinking,
        // fitness,
        // lifestyle,
        // personality,
        // languages,
        // hobies,
        // favPlaces,
        // interests,
        // cuisin,
        // starSign
      )
    ) {
      return
    }
    return true
  }

  const _onSetFilter = () => {
    setShowHand(false)
    setIsPreferancesModalVisible(false)
    const isValid = _validations()
    if (!isValid) return

    setLoading(true)

    const apiData = new FormData()
    apiData.append('interested_in', preferredGenderValue?.id || 4)
    // apiData.append(
    //   'looking_for',
    //   userData?.filters?.looking_for || LOOKING_FOR[0]
    // )
    apiData.append('distance', maxDistance.toString() || '100')
    apiData.append('from_age', age[0]?.toString() || '18')
    apiData.append('to_age', age[1]?.toString() || '99')
    apiData.append('is_location', userData?.filters?.is_location || '1')
    apiData.append('maximum_height', maxHeight || '7')
    apiData.append('ink', ink?.name || INK[0])
    apiData.append('education', education?.name || EDUCATION[0])
    apiData.append('occupation', occupation?.name || OCCUPATION[0])
    apiData.append('children', children?.name || CHILDREN[0])
    apiData.append('pets', Number(pets) || 1)
    apiData.append('religion', religion?.name || RELIGION[0])
    apiData.append('is_smoker', Number(isSmoker) || 1)
    apiData.append('sexuality', sexualityValue?.id || '1')
    apiData.append('piercing', piercingValue ? 1 : 2 || 1)
    apiData.append('foodie', foodie ? 1 : 2 || 1)
    apiData.append('drinking', drinking?.id || DRINKING[0]?.id)
    apiData.append('fitness', fitness?.id || FITNESS[0]?.id)
    apiData.append('lifestyle', lifestyle?.id || LIFE_STYLE[0]?.id)
    apiData.append('driving_license', drivingLicense ? 1 : 2 || 1)
    apiData.append('personality', personality?.id || '1')
    apiData.append('lat', 30.7191 || coordinates?.latitude || null);
    apiData.append('long', 76.8103 || coordinates?.longitude || null);
    // apiData.append('long', coordinates?.longitude || null)
    apiData.append('location', selectedAddress)
    apiData.append(
      'languages',
      languages.map(ite => ite?.id)
    )
    apiData.append(
      'hobbies',
      hobies.map(ite => ite?.id)
    )
    apiData.append(
      'favourite_place',
      favPlaces.map(ite => ite?.id)
    )
    apiData.append(
      'interests',
      interests.map(ite => ite?.id)
    )
    apiData.append(
      'cuisin',
      cuisin.map(ite => ite?.id)
    )

    console.log(
      userData?.filters.long,
      'hsdhfjsdhfjkshdfjsdhfjsdhjsdf',
      coordinates
    )

    // const s = {
    //   // interested_in: preferredGenderValue?.id,
    //   // distance: maxDistance.toString(),
    //   // from_age: age[0].toString(),
    //   // to_age: age[1].toString(),
    //   // maximum_height: maxHeight,
    //   weight,
    //   body_type: bodyTypeValue?.name,
    //   is_smoker: smokersValue ? '1' : '2',
    //   tribes: tribesValue?.name,
    //   hair: hairValue?.name,
    //   sexuality: sexualityValue?.id,
    //   piercing: piercingValue ? '1' : '2',
    //   is_location: userData?.is_location || '1',
    //   bedroom_antics: bedRoomAnticsValue?.id
    // }

    setBonkersFiltersApi(apiData)
      .then(res => {
        _hitApiFromStart()
        showSuccess(res?.message || 'Success')
        _setFilterValues()
      })
      .catch(error => {
        showError(ApiError(error))
        console.log(err)
        setLoading(false)
      })

    // console.log(apiData, 'api data im sending ======>>>>>>>>>>>>')
    // setPreferances(apiData)
    //   .then(res => {
    //     console.log(res, 'response setPreferances')
    //     _hitApiFromStart()
    //     showSuccess(res?.message || 'Success')
    //   })
    //   .catch(err => {
    //     console.log(err, 'error setPreferances')
    //     setLoading(false)
    //   })
  }

  const _showTutorial = () => {
    if (!showTutorial) return
    setTimeout(() => {
      translateX.value = withTiming(100, { duration: 500 })
      setTimeout(() => {
        translateX.value = withTiming(-100, { duration: 500 })
      }, 500)
      setTimeout(() => {
        translateX.value = withTiming(0, { duration: 500 })
      }, 1200)
    }, 500)
    saveTutorialStatus(false)
  }

  const scaleY = useSharedValue(1)
  const scale = useSharedValue(1)

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: rotate.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scaleY: scaleY.value },
        { scale: scale.value }
      ]
    }
  })

  const _openBanner = () => {
    setBannerModal(prevBanner => ({ ...prevBanner, isVisible: false }))
    setLoading(true)

    const apiData = {
      advertisement_id: bannerModal?.data?.id,
      type: 2
    }
    likeAdvertisementApi(apiData)
      .then(res => {
        Linking.canOpenURL(bannerModal?.data?.redirect_url).then(supported => {
          if (supported) {
            Linking.openURL(bannerModal?.data?.redirect_url)
          } else {
            showError('Failed to open')
          }
        })
        setLoading(false)
      })
      .catch(error => {
        setLoading(false)
        showError(ApiError(error))
      })
  }

  const thumbRotate = useSharedValue('0deg')

  const rThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: thumbRotate.value }]
    }
  })

  const _handAnimation = type => {
    if (type == '_APPLY') {
      thumbRotate.value = withTiming('30deg', { duration: 1500 })
    } else {
      thumbRotate.value = '0deg'
    }
  }

  if (
    userData?.total_free_matches === 'Unlimited' ||
    userData?.total_free_matches > 0
  ) {
    return (
      <WrapperContainer>
        {/* <HeaderComp
        onPressRightIcon={() => setIsPreferancesModalVisible(true)}
        rightIcon={imagesPath.ic_filter}
        textName={userData?.city + ',' + userData?.country}
      /> */}

        <HomeHeader onPressFilter={() => setIsPreferancesModalVisible(true)} />

        <View style={{ flex: 0.8, zIndex: 10 }}>
          {selectedCardToSlide?.first_name && (
            <View
              style={{
                position: 'absolute',
                opacity: 0.2,
                height: height / 2,
                marginTop: moderateScale(120),
                marginStart: width / 4.1,
                transform: [{ rotate: '-20deg' }]
              }}>
              {cardsData.map((item, index) => {
                if (item?.id === selectedCardToSlide?.id) {
                  return null
                }
                return (
                  <RenderCards
                    key={item?.id + index.toString()}
                    temp={true}
                    length={cardsData.length}
                    item={item}
                    name={item?.full_name}
                    age={item?.age}
                    occupation={item?.occupation}
                    index={index}
                  />
                )
              })}
            </View>
          )}

          {!selectedCardToSlide?.first_name && (
            <>
              <View
                style={{
                  height: height / 2,
                  marginTop: moderateScale(120),
                  marginStart: width / 4.1,
                  transform: [{ rotate: '-20deg' }],
                  position: 'absolute'
                }}>
                {cardsData.map((item, index) => {
                  return (
                    <RenderCards
                      temp={false}
                      key={item?.id + index.toString()}
                      length={cardsData.length}
                      item={item}
                      index={index}
                      gestureHandler={gestureHandler}
                      name={item?.first_name}
                      age={item?.age}
                      occupation={item?.occupation}
                      disabledTouchFromChild={val => {
                        setDisabledTouch(val)
                        setShowHand(false)
                      }}
                      selectedCardValue={item => {
                        console.log(item, 'itemitemitemitemitem')
                        translateY.value = 0
                        ApplyEaseOutAnimation()
                        setTimeout(() => {
                          setSelectedCardToSlide(item)
                        }, 0)
                        _showTutorial()
                      }}
                    />
                  )
                })}
              </View>
              {/* {showHand && Array.isArray(cardsData) && cardsData.length > 0 && (
                <>
                  <View
                    style={{
                      height: moderateScale(250),
                      width: moderateScale(250),
                      position: 'absolute',
                      marginTop: height / 2.32,
                      // bottom: -moderateScale(70),
                      marginStart: width / 3.7,
                      zIndex: -10
                    }}>
                    <Image
                      source={imagesPath.ic_hand}
                      style={{
                        height: '100%',
                        width: '100%',
                        resizeMode: 'contain'
                      }}
                    />
                  </View>
                  <Animated.View
                    style={[
                      {
                        height: moderateScale(100),
                        width: moderateScale(100),
                        position: 'absolute',
                        marginTop: height / 2.18,
                        // bottom: moderateScale(58),
                        marginStart: width / 2.5 - moderateScale(10),
                        zIndex: selectedCardToSlide ? -100 : 100
                      }
                    ]}>
                    <Animated.Image
                      source={imagesPath.ic_thumb}
                      style={[
                        {
                          height: '100%',
                          width: '100%',
                          resizeMode: 'contain'
                        },
                        rThumbStyle
                      ]}
                    />
                  </Animated.View>
                </>
              )} */}
            </>
          )}

          {!cardRefresh &&
            !(Array.isArray(cardsData) && cardsData.length > 0)
            ? (
              <ListEmptyComponent
                icon={imagesPath.out_of_swipes}
                firstMessage={'Oops! You are out of swipes.'}
              />
            )
            : (
              <></>
            )}

          {selectedCardToSlide?.first_name && (
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View>
                <View>
                  <Animated.View
                    style={[
                      {
                        height: CARD_HEIGHT,
                        width: CARD_WIDTH,
                        justifyContent: 'center',
                        alignSelf: 'center',
                        backgroundColor: colors.lightGrey,
                        borderRadius: moderateScale(12),
                        marginTop: moderateScale(96),
                        marginStart: moderateScale(0)
                      },
                      cardStyle
                    ]}
                    activeOpacity={1}>
                    <Animated.Image
                      source={imagesPath.ic_like_card}
                      style={[
                        {
                          width: moderateScale(80),
                          height: moderateScale(80),
                          position: 'absolute',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          zIndex: 1,
                          elevation: 1
                        },
                        likeStyle
                      ]}
                      resizeMode="contain"
                    />

                    {/* <Animated.View
                      activeOpacity={0.9}
                      style={[
                        {
                          width: moderateScale(80),
                          height: moderateScale(80),
                          borderRadius: moderateScale(45),
                          position: 'absolute',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          zIndex: 1,
                          elevation: 1,
                          alignItems: 'center',
                          borderColor: colors.grey_187_1,
                          backgroundColor: colors.themecolor2
                        },
                        likeStyle
                      ]}>
                      <Text
                        style={{
                          ...commonStyles.font_10_bold,
                          color: colors.black,
                          textAlign: 'center'
                        }}>
                        {'No Thank you'}
                      </Text>
                    </Animated.View> */}

                    {/* <Animated.View
                      activeOpacity={0.9}
                      style={[
                        {
                          width: moderateScale(80),
                          height: moderateScale(80),
                          borderRadius: moderateScale(45),
                          position: 'absolute',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          zIndex: 1,
                          elevation: 1,
                          alignItems: 'center',
                          borderColor: colors.grey_187_1,
                          backgroundColor: colors.pink_164
                        },
                        nopeStyle
                      ]}>
                      <Text
                        style={{
                          ...commonStyles.font_10_bold,
                          color: colors.black,
                          textAlign: 'center'
                        }}>
                        {"Let's Match"}
                      </Text>
                    </Animated.View> */}

                    <Animated.Image
                      source={imagesPath.ic_reject_card}
                      style={[
                        {
                          width: moderateScale(80),
                          height: moderateScale(80),
                          position: 'absolute',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          zIndex: 1,
                          elevation: 1
                        },
                        nopeStyle
                      ]}
                      resizeMode="contain"
                    />

                    <ActivityIndicator
                      animating={true}
                      color={colors.black}
                      style={{
                        position: 'absolute',
                        marginStart: CARD_WIDTH / 2.4
                      }}
                    />

                    <ImageBackground
                      source={{
                        uri:
                          selectedCardToSlide?.profile_image_thumb ||
                          selectedCardToSlide?.profile_image
                      }}
                      style={{
                        height: CARD_HEIGHT,
                        width: CARD_WIDTH,
                        borderRadius: moderateScale(12),
                        overflow: 'hidden',
                        // borderWidth: 0.3,
                        // borderColor: colors.borderGrey,
                        justifyContent: 'flex-end'
                      }}>
                      <View
                        style={{
                          position: 'absolute',
                          right: moderateScale(8),
                          top: moderateScale(8)
                        }}>
                        {ShowGender(selectedCardToSlide?.gender)}
                      </View>

                      <TouchableOpacity
                        style={{
                          padding: moderateScale(6),
                          backgroundColor: colors.blackOpacity50
                        }}
                        activeOpacity={1}
                        onPress={() =>
                          navigation.navigate(navigationString.VIEWPROFILE, {
                            prevScreenData: selectedCardToSlide
                          })
                        }>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '100%',
                          justifyContent: 'space-between'
                        }}>
                          <Text
                            style={{
                              ...commonStyles.font_12_bold,
                              color: colors.white,
                              width: '80%',
                              paddingEnd: moderateScale(6)
                            }}
                            numberOfLines={2}>
                            {selectedCardToSlide?.first_name +
                              ',' +
                              selectedCardToSlide?.age}
                          </Text>
                          <CountryFlag
                            isoCode={selectedCardToSlide?.country_flag || 'GB'}
                            size={moderateScale(14)}
                          />
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}>
                          <Text
                            style={{
                              ...commonStyles.font_10_SemiBold,
                              color: colors.white,
                              lineHeight: moderateScale(24),
                              maxWidth: '100%'
                            }}
                            numberOfLines={2}>
                            {selectedCardToSlide?.occupation}
                          </Text>

                          {/* <Text
                            style={{
                              ...commonStyles.font_10_SemiBold,
                              color: colors.white,
                            }}>
                            {' | '}
                          </Text>

                          <Image
                            source={imagesPath.white_star}
                            style={{
                              height: 12,
                              width: 12,
                            }}
                          />
                          <Text
                            style={{
                              ...commonStyles.font_10_SemiBold,
                              color: colors.white,
                              lineHeight: moderateScale(24),
                            }}
                            numberOfLines={2}>
                            {' ' + selectedCardToSlide?.rating}
                          </Text> */}
                        </View>
                      </TouchableOpacity>
                    </ImageBackground>
                  </Animated.View>
                </View>
              </Animated.View>
            </PanGestureHandler>
          )}

          {disabledTouch ? (
            <View
              style={{
                height,
                width,
                backgroundColor: 'transparent',
                position: 'absolute',
                top: 0
              }}
            />
          ) : (
            <></>
          )}

        </View>

        {/* {!selectedCardToSlide?.first_name
          ? (
            <Image
              source={
                selectedCardToSlide?.first_name
                  ? null
                  : imagesPath.ic_bonkers_home_new
              }
              style={{
                height: '100%',
                width: '100%',
                zIndex: 0
              }}
              resizeMode={'contain'}
            />
          )
          : (
            <></>
          )} */}

        {selectedCardToSlide?.first_name && (
          <RenderJackQueenButtons
            onPressJack={_onDislikeCard}
            onPressFriend={_onFriendCard}
            onPressQueen={_onLikeCard}
          />
        )}

        <Modal isVisible={isPreferancesModalVisible} style={styles.modalStyle}>
          <View style={styles.modalMainContainer}>
            <View style={styles.modalContainer}>
              <View style={styles.headerView}>
                <TouchableOpacity
                  onPress={() => setIsPreferancesModalVisible(false)}
                  hitSlop={hitSlopProp}>
                  <Image
                    source={imagesPath.ic_right_icon}
                    style={{
                      transform: [{ rotate: '180deg' }]
                    }}
                  />
                </TouchableOpacity>
                <Text
                  style={{ ...styles.textStyle, marginLeft: moderateScale(30) }}>
                  {strings.filters}
                </Text>

                {/* <GradientText
                  text={strings.filters}
                  textStyle={styles.textStyle}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0.99, y: 1 }}
                /> */}
                <View />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: moderateScale(40), backgroundColor: colors.white }}>
                {indexTwoView()}
                {/* {showBonks && userData?.subscription?.subscription_id > 1 && (
                  <SetLocationFilter
                    selectAddressFromChild={address => {
                      console.log(address, 'SetLocationFilter')
                      setSelectedAddress(address)
                    }}
                    setCoordinatesFromChild={coords => {
                      console.log(coords, 'SetLocationFilter')
                      setCoordinates(coords)
                    }}
                  />
                )} */}
              </ScrollView>

              <ButtonComp
                onPressBtn={_onSetFilter}
                btnText={strings.continue}
                btnStyle={{ marginHorizontal: moderateScale(20) }}
              />
            </View>
          </View>
        </Modal>

        <Modal isVisible={bannerModal?.isVisible} style={styles.modalStyle}>
          <BannerComp
            bannerModal={bannerModal}
            onLoadEnd={() =>
              setBannerModal(prevBanner => ({
                ...prevBanner,
                bannerImgLoad: false
              }))
            }
            openBanner={_openBanner}
            closeBanner={() =>
              setBannerModal(prevBanner => ({
                ...prevBanner,
                isVisible: false
              }))
            }
          />
          {/* <ImageBackground
          style={{
            height: height / 1.6,
            width: width / 1.3,
            backgroundColor: colors.white,
            alignSelf: 'center',
            borderRadius: moderateScale(12)
          }}
          onLoadEnd={() =>
            setBannerModal(prevBanner => ({
              ...prevBanner,
              bannerImgLoad: false
            }))
          }
          resizeMode={'stretch'}
          source={{ uri: bannerModal?.data?.banner_image }}>
          {!bannerModal?.bannerImgLoad
            ? (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.blackOpacity15,
                  height: height / 1.6,
                  width: width / 1.3,
                  paddingStart: moderateScale(24)
                }}
                onPress={_openBanner}
                activeOpacity={0.9}>
                <TouchableOpacity
                  onPress={() =>
                    setBannerModal(prevBanner => ({
                      ...prevBanner,
                      isVisible: false
                    }))
                  }
                  hitSlop={hitSlopProp}>
                  <Image
                    source={imagesPath.ic_cross}
                    style={{
                      tintColor: colors.white,
                      transform: [{ rotate: '180deg' }],
                      margin: moderateScale(16),
                      alignSelf: 'flex-end'
                    }}
                  />
                </TouchableOpacity>

                <Text style={commonStyles.font_20_SemiBold}>
                  {bannerModal?.data?.title}
                </Text>
              </TouchableOpacity>
            )
            : (
              <ActivityIndicator
                animating={bannerModal?.bannerImgLoad}
                size={'large'}
                color={colors.likePink}
                style={{ marginTop: height / 1.6 / 2 }}
              />
            )}
        </ImageBackground> */}
        </Modal>

        {disabledTouch
          ? (
            <View
              style={{
                height,
                width,
                backgroundColor: 'transparent',
                position: 'absolute',
                top: 0
              }}
            />
          )
          : (
            <></>
          )}
        <Loader isLoading={isLoading} />
      </WrapperContainer>
    )
  } else {
    return (
      <WrapperContainer>
        <HomeHeader onPressFilter={() => setIsPreferancesModalVisible(true)} />
        <View
          style={{
            flex: 0.95,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <Text
            style={{
              ...commonStyles.font_16_SemiBold,
              textAlign: 'center',
              lineHeight: moderateScale(26)
            }}>
            Sorry, you are out of matches.{'\n'}Please upgrade package to get
            more matches.
          </Text>
          <ButtonComp
            btnText="Upgrade Package"
            btnView={{
              justifyContent: 'flex-start',
              paddingHorizontal: moderateScale(40),
              marginTop: moderateScale(40)
            }}
            onPressBtn={() =>
              navigation.navigate(navigationString.SUBSCRIPTION_SCREEN)
            }
          />
        </View>
      </WrapperContainer>
    )
  }
}

const styles = StyleSheet.create({
  imgStyle: {
    width: moderateScale(296),
    height: moderateScale(450),
    borderRadius: moderateScale(16),
    alignSelf: 'center'
  },
  blurView: {
    position: 'absolute',
    backgroundColor: colors.blackOpacity60,
    bottom: 0,
    width: moderateScale(296),
    borderBottomEndRadius: moderateScale(16),
    borderBottomStartRadius: moderateScale(16),
    padding: moderateScale(16)
  },
  circleView: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    marginTop: moderateScale(40)
  },
  circleStyle: {
    height: moderateScale(70),
    width: moderateScale(70),
    backgroundColor: colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(37)
  },
  bottomSheetView: {
    flex: 1,
    backgroundColor: 'pink'
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center'
  },
  textStyle: {
    ...commonStyles.font_24_bold
  },
  switchView: {
    height: moderateScale(58),
    borderWidth: 0.2,
    borderRadius: moderateScale(15),
    marginTop: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  slider: {
    height: 45,
    width: '80%'
  },
  thirdView: {
    height: moderateScale(58),
    borderWidth: 0.5,
    borderTopRightRadius: moderateScale(15),
    borderBottomRightRadius: moderateScale(15),
    width: moderateScale(104),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.gray4
  },
  secView: {
    height: moderateScale(58),
    borderWidth: 0.5,
    width: moderateScale(104),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.gray4
  },
  firstView: {
    height: moderateScale(58),
    // backgroundColor: index == 1 ? colors.black : colors.white,
    borderWidth: 0.5,
    borderTopLeftRadius: moderateScale(15),
    borderBottomLeftRadius: moderateScale(15),
    width: moderateScale(104),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.gray4
  },
  viewStyle: {
    paddingHorizontal: moderateScale(10),
    flex: 1
  },
  filterView: {
    alignItems: 'center',
    marginTop: moderateScale(22)
  },
  clearView: {
    position: 'absolute',
    right: moderateScale(40),
    top: moderateScale(30)
  },
  txtStyle: {
    ...commonStyles.font_16_SemiBold
  },
  textView: {
    ...commonStyles.font_16_bold,
    marginTop: moderateScale(16)
  },
  modalStyle: {
    margin: 0,
    backgroundColor: colors.white
  },
  modalMainContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalContainer: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    // paddingHorizontal: moderateScale(30),
    paddingTop: moderateScale(32),
    paddingBottom: moderateScale(40),
    height: height / 1.1,
    // backgroundColor: colors.darkBlack
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(10),
    justifyContent: 'space-between',
    // backgroundColor: colors.darkBlack,
    marginHorizontal: moderateScale(20)
  },
  headerTextView: {
    flex: 1,
    alignItems: 'center'
  }
})

export default Home
