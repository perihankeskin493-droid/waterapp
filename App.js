import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  AppState,
  Linking,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

// === NOTIFICATION CHANNEL SETUP ===
const setupNotificationChannel = async () => {
  // Sadece Android için bildirim kanalı oluştur
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('water_reminder', {
      name: 'Su Hatırlatıcı',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A237E',
      sound: 'default',
    });
  }
};
// === NOTIFICATION CHANNEL SETUP END ===

// DİL ÇEVİRİLERİ - SADECE TÜRKÇE (Türkiye için)
const translations = {
  tr: {
    appName: 'SU TAKİP',
    tagline: 'PROFESYONEL HİDRASYON TAKİBİ',
    today: 'BUGÜN',
    target: 'HEDEF',
    glasses: 'BARDAK',
    glassesDrank: 'İÇİLEN BARDAK',
    logWater: 'SU İÇİLDİ',
    quickAdd: '+1 +2 +3',
    premiumBannerTitle: "PREMIUM'A GEÇ",
    premiumBannerSubtitle: 'Tüm Özellikler • Reklamsız • Sınırsız Geçmiş',
    upgrade: 'YÜKSELT',
    premium: 'PREMIUM',
    resetDay: 'GÜNÜ SIFIRLA',
    settings: 'AYARLAR',
    dailyGoal: '📅 GÜNLÜK HEDEF AYARLARI',
    healthBenefits: '💎 SU İÇMENİN BİLİMSEL FAYDALARI',
    hydrationStats: '📊 HİDRASYON İSTATİSTİKLERİNİZ',
    totalGlasses: 'TOPLAM BARDAK',
    dailyAverage: 'GÜNLÜK ORTALAMA',
    goalsMet: 'HEDEFLER TUTTURULDU',
    daysTracked: 'TAKİP EDİLEN GÜN',
    missionAccomplished: 'GÖREV TAMAMLANDI!',
    timeToHydrate: 'HİDRE OLMA ZAMANI!',
    onTrack: '{goal} BARDAK HEDEFİ İÇİN YOLDA!',
    requiresPremium: "10'dan fazla hedef için Premium gerekli",
    footer: '💧 SUSUZ KALMA • SAĞLIKLI KAL • ÜRETKEN KAL',
    copyright: '© 2024 Water&Su Hatırlatıcı • v1.0.2 • {edition}',
    premiumFeatures: [
      'ENERJİYİ ARTIRIR',
      'YAĞ YAKAR',
      'CİLDİ TEMİZLER',
      'ODAKLANMAYI GELİŞTİRİR',
      'DETOKS YAPAR',
      'BAĞIŞIKLIĞI GÜÇLENDİRİR'
    ],
    premiumDescriptions: [
      'Metabolizmayı %30 hızlandırır',
      '%24 daha hızlı yağ yakımı',
      'Kırışıklıkları %45 azaltır',
      '%85 daha iyi konsantrasyon',
      'Toksinleri doğal olarak atar',
      'Hastalıkları %60 azaltır'
    ],
    adTitle: "📺 Water&Su Hatırlatıcı'yı Destekle",
    adMessage: 'Bu reklam uygulamanın ücretsiz kalmasını sağlar. Reklamsız deneyim için Premium\'a geçin.',
    watchAd: 'Reklam İzle',
    goPremium: "Premium'a Geç",
    skip: 'Atla',
    premiumOfferTitle: '⭐ WATER&SU HATIRLATICI PREMIUM\'A YÜKSELT',
    premiumOfferMessage: 'Tüm özelliklerin kilidini aç ve geliştirmeyi destekle:',
    monthly: 'Aylık - 89,99₺',
    yearly: 'Yıllık - 599,99₺ (%44 Tasarruf)',
    lifetime: 'Ömür Boyu - 1.499,99₺',
    restorePurchase: 'Satın Almayı Geri Yükle',
    maybeLater: 'Belki Sonra',
    welcomePremium: '🎉 PREMIUM\'A HOŞGELDİNİZ!',
    thankYou: '{plan} planını satın aldığınız için teşekkürler!\n\nTüm özellikler şimdi aktif.',
    exploreFeatures: 'ÖZELLİKLERİ KEŞFET',
    goalAchievedTitle: '🏆 GÜNLÜK HEDEFE ULAŞILDI!',
    goalAchievedMessage: 'Harika iş çıkardın! 🎉\nGünlük su hedefine başarıyla ulaştın!',
    shareAchievement: 'BAŞARIYI PAYLAŞ 📤',
    setNewGoal: 'YENİ HEDEF BELİRLE 🎯',
    keepGoing: 'DEVAM ET! 💪',
    awesome: 'SÜPER!',
    shareMessage: 'Water&Su Hatırlatıcı ile bugün {count} bardak su içerek hedefime ulaştım! 💧 #SusuzKalma #SağlıklıYaşa',
    setGoal: '🎯 YENİ HEDEF BELİRLE',
    chooseGoal: 'Günlük hidrasyon hedefini seç:',
    sixGlasses: '6 Bardak',
    eightGlasses: '8 Bardak (Önerilen)',
    tenGlasses: '10 Bardak',
    twelveGlasses: '12 Bardak',
    custom: 'Özel',
    cancel: 'İptal',
    customGoal: 'ÖZEL HEDEF',
    enterGoal: 'Günlük bardak hedefini gir:',
    set: 'Ayarla',
    goalUpdated: '🎯 HEDEF GÜNCELLENDİ',
    goalSet: 'Günlük hedef {goal} bardak olarak ayarlandı!',
    resetTracker: '🔄 TAKİPÇİYİ SIFIRLA',
    resetConfirm: 'Bugünkü su alımını sıfırlamak istiyor musun?',
    reset: 'Sıfırla',
    premiumLocked: '🔒 PREMIUM ÖZELLİK',
    premiumRequired: '10 bardaktan fazla hedefler için Premium yükseltmesi gerekli.',
    upgradeNow: 'Şimdi Yükselt',
    notifications: 'BİLDİRİMLER',
    manageNotifications: 'BİLDİRİMLERİ YÖNET',
    notificationSubtitle: 'Hatırlatmaları aç/kapat',
    testNotification: 'Test Bildirimi Gönder',
    notificationInfo: '📱 Bildirimler: 08:00, 12:00, 16:00, 20:00 saatlerinde gönderilir',
    notificationPermissionTitle: 'Bildirim İzni Gerekli',
    notificationPermissionMessage: 'Su içme hatırlatmalarını alabilmek için lütfen bildirim iznini açın. Ayarlar sayfasına yönlendirileceksiniz.',
    openSettings: 'Şimdi Aç',
    later: 'Sonra',
    notificationSuccess: '✅ Bildirimler Aktif!',
    notificationSuccessMessage: 'Artık 4 saatte bir su içmeniz hatırlatılacak!',
    testNotificationSuccess: '✅ Başarılı',
    testNotificationMessage: 'Test bildirimi gönderildi!',
    paymentIntegrationRequired: 'Ödeme Sistemi Entegrasyonu Gerekli',
    paymentIntegrationMessage: 'Premium özellikleri satın almak için ödeme sistemi entegrasyonu gereklidir. Geliştiriciye başvurun.'
  }
};

// Bildirim mesajları (güzel sözlerle)
const notificationMessages = [
  {
    title: "💧 Su Zamanı!",
    body: "Bir bardak su iç ve enerjini yenile. Unutma, su hayattır!"
  },
  {
    title: "🚀 Hidrasyon Zamanı",
    body: "Bedenini şımartmak için bir bardak su iç. Cildin sana teşekkür edecek!"
  },
  {
    title: "🌟 Sağlık İçin",
    body: "Su içmek için en güzel zaman şimdi! Metabolizmanı hızlandır."
  },
  {
    title: "⚡ Enerji Dopingi",
    body: "Bir bardak su ile odaklanmanı artır. Daha üretken ol!"
  },
  {
    title: "🌊 Detoks Zamanı",
    body: "Vücudunu toksinlerden arındır. Bir bardak su iç!"
  },
  {
    title: "🏆 Başarı İçin",
    body: "Her başarının arkasında düzenli su içme alışkanlığı vardır!"
  },
  {
    title: "🌺 Güzellik Sırrı",
    body: "Parlayan bir cilt için su iç. Doğal güzellik iksiri!"
  },
  {
    title: "🧠 Zihin Açıklığı",
    body: "Beynin %75'i sudur. Daha iyi düşünmek için su iç!"
  }
];

export default function App() {
  const [waterCount, setWaterCount] = useState(0);
  const [goal, setGoal] = useState(8);
  const [history, setHistory] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [adCounter, setAdCounter] = useState(0);
  const [language] = useState('tr');
  const [waterLevel] = useState(new Animated.Value(0));
  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);
  const appState = useRef(AppState.currentState);
  
  const t = translations[language];

  // Uygulama durumu değişikliğini dinle (arka plan -> ön plan)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(nextAppState);

      if (nextAppState === 'active') {
        // Uygulama ön plana geldiğinde, bildirim izinlerini kontrol et
        checkAndRequestNotificationPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Bildirim izinlerini kontrol et ve gerekirse iste
  const checkAndRequestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus !== 'granted') {
      // EXPO'nun kendi izin isteme diyaloğunu kullan
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        // İzin verilmediyse, kullanıcıyı uygulama ayarlarına yönlendiren bir butonla bilgilendir
        Alert.alert(
          t.notificationPermissionTitle,
          t.notificationPermissionMessage,
          [
            { text: t.openSettings, onPress: () => Linking.openSettings() },
            { text: t.later, style: 'cancel' }
          ]
        );
        return false;
      }
    }
    
    // İzin varsa bildirimleri planla
    await scheduleDailyNotifications();
    return true;
  };

  // Bildirim zamanlaması yapma (4 saatte bir)
  const scheduleDailyNotifications = async () => {
    try {
      // Tüm planlı bildirimleri temizle
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      const startHour = 8;
      const endHour = 22;
      const intervalHours = 4;
      
      for (let hour = startHour; hour <= endHour; hour += intervalHours) {
        const randomIndex = Math.floor(Math.random() * notificationMessages.length);
        const message = notificationMessages[randomIndex];
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: message.title,
            body: message.body,
            sound: 'default',
            data: { type: 'water_reminder' },
            ...(Platform.OS === 'android' && { channelId: 'water_reminder' }),
          },
          trigger: {
            hour: hour,
            minute: Math.floor(Math.random() * 30),
            repeats: true,
          },
        });
      }
      
      console.log('Bildirimler başarıyla planlandı.');
      return true;
    } catch (error) {
      console.error('Bildirim planlama hatası:', error);
      return false;
    }
  };

  useEffect(() => {
    loadData();
    const today = new Date().toDateString();
    checkDailyReset(today);
    checkPremiumStatus();
    
    // Notification channel kurulumu
    setupNotificationChannel();
    
    // Uygulama açıldığında bildirim izinlerini kontrol et
    checkAndRequestNotificationPermissions();
    
    Animated.timing(waterLevel, {
      toValue: Math.min(waterCount / goal, 1),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [waterCount, goal]);

  const loadData = async () => {
    try {
      const savedCount = await AsyncStorage.getItem('waterCount');
      const savedGoal = await AsyncStorage.getItem('waterGoal');
      const savedHistory = await AsyncStorage.getItem('waterHistory');
      const savedPremium = await AsyncStorage.getItem('isPremium');
      
      if (savedCount !== null) setWaterCount(parseInt(savedCount));
      if (savedGoal !== null) setGoal(parseInt(savedGoal));
      if (savedHistory !== null) setHistory(JSON.parse(savedHistory));
      if (savedPremium !== null) setIsPremium(JSON.parse(savedPremium));
    } catch (error) {
      console.log('Yükleme hatası:', error);
    }
  };

  const saveData = async (count, goalValue, historyData, premiumStatus) => {
    try {
      await AsyncStorage.setItem('waterCount', count.toString());
      await AsyncStorage.setItem('waterGoal', goalValue.toString());
      await AsyncStorage.setItem('waterHistory', JSON.stringify(historyData));
      await AsyncStorage.setItem('isPremium', JSON.stringify(premiumStatus));
    } catch (error) {
      console.log('Kayıt hatası:', error);
    }
  };

  const checkDailyReset = (today) => {
    const lastDate = history[history.length - 1]?.date;
    if (lastDate !== today && waterCount > 0) {
      resetWater(true);
    }
  };

  const checkPremiumStatus = async () => {
    const hasPremium = await AsyncStorage.getItem('userPremium');
    setIsPremium(hasPremium === 'true');
  };

  const addWater = (amount = 1) => {
    if (!isPremium) {
      const newAdCounter = adCounter + 1;
      setAdCounter(newAdCounter);
      
      if (newAdCounter >= 5) {
        setAdCounter(0);
        showAd();
      }
    }

    const newCount = waterCount + amount;
    const today = new Date().toDateString();
    
    setWaterCount(newCount);
    
    const newHistory = [...history];
    const todayIndex = newHistory.findIndex(item => item.date === today);
    
    if (todayIndex !== -1) {
      newHistory[todayIndex].count += amount;
    } else {
      newHistory.push({ date: today, count: amount });
      
      if (!isPremium && newHistory.length > 7) {
        newHistory.shift();
      }
    }
    
    setHistory(newHistory);
    saveData(newCount, goal, newHistory, isPremium);
    
    if (newCount >= goal) {
      showAchievementNotification();
    }
  };

  const showAd = () => {
    Alert.alert(
      "📺 Demo Reklam",
      "Bu bir demo reklamdır. Gerçek uygulamada reklamlar gösterilecektir.",
      [
        { 
          text: "Demo Reklamı İzle", 
          onPress: () => {
            setTimeout(() => {
              Alert.alert('✅ Demo Tamamlandı!', 'Demo reklamı izlediniz.');
            }, 1000);
          }
        },
        { 
          text: "Premium Demo", 
          onPress: () => showPremiumOffer()
        },
        { text: "Kapat", style: "cancel" },
      ]
    );
  };

  const showPremiumOffer = () => {
    Alert.alert(
      t.premiumOfferTitle,
      t.premiumOfferMessage,
      [
        { 
          text: t.monthly, 
          onPress: () => purchasePremium('monthly') 
        },
        { 
          text: t.yearly, 
          onPress: () => purchasePremium('yearly') 
        },
        { 
          text: t.lifetime, 
          onPress: () => purchasePremium('lifetime') 
        },
        { 
          text: t.restorePurchase, 
          onPress: () => restorePurchase()
        },
        { text: t.maybeLater, style: "cancel" },
      ]
    );
  };

  // ÖDEME SİSTEMİ ENTEGRASYONU GEREKLİ - BU KISMI DEĞİŞTİRMELİSİNİZ
  const purchasePremium = async (plan) => {
    Alert.alert(
      t.paymentIntegrationRequired,
      t.paymentIntegrationMessage,
      [{ text: "Tamam", style: "default" }]
    );
    
    // GERÇEK ÖDEME ENTEGRASYONU İÇİN BU KISMI DEĞİŞTİRİN
    // Örnek: Google Play Billing veya RevenueCat entegrasyonu yapmalısınız
    // Şimdilik premium'u aktif etmiyoruz - bu Play Store politikalarına aykırı
  };

  const restorePurchase = async () => {
    Alert.alert('Demo Modu', 'Satın alma işlemi demo modunda devre dışıdır.');
  };

  const showAchievementNotification = () => {
    Alert.alert(
      t.goalAchievedTitle,
      t.goalAchievedMessage,
      [
        { 
          text: t.shareAchievement, 
          style: 'default',
          onPress: () => shareAchievement() 
        },
        { 
          text: t.setNewGoal, 
          style: 'default',
          onPress: () => showGoalSettings() 
        },
        { 
          text: t.keepGoing, 
          style: 'cancel',
          onPress: () => {} 
        },
      ]
    );
  };

  const shareAchievement = async () => {
    const message = t.shareMessage.replace('{count}', waterCount);
    try {
      await Share.share({
        message: message,
        title: 'Su Hedefime Ulaştım! 💧',
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir sorun oluştu.');
    }
  };

  const showGoalSettings = () => {
    Alert.alert(
      t.setGoal,
      t.chooseGoal,
      [
        { text: t.sixGlasses, onPress: () => changeGoal(6) },
        { text: t.eightGlasses, onPress: () => changeGoal(8) },
        { text: t.tenGlasses, onPress: () => changeGoal(10) },
        { text: t.twelveGlasses, onPress: () => changeGoal(12) },
        { text: t.custom, onPress: () => showCustomGoal() },
        { text: t.cancel, style: 'destructive' },
      ]
    );
  };

  const showCustomGoal = () => {
    Alert.prompt(
      t.customGoal,
      t.enterGoal,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.set, onPress: (value) => {
          const numValue = parseInt(value);
          if (numValue > 0 && numValue <= 20) {
            changeGoal(numValue);
          }
        }},
      ],
      'plain-text',
      goal.toString()
    );
  };

  const changeGoal = (newGoal) => {
    if (!isPremium && newGoal > 10) {
      Alert.alert(
        t.premiumLocked,
        t.premiumRequired,
        [
          { text: t.upgradeNow, onPress: () => showPremiumOffer() },
          { text: t.cancel, style: 'cancel' },
        ]
      );
      return;
    }
    
    setGoal(newGoal);
    saveData(waterCount, newGoal, history, isPremium);
    Alert.alert(
      t.goalUpdated,
      t.goalSet.replace('{goal}', newGoal),
      [{ text: 'TAMAM', style: 'default' }]
    );
  };

  const resetWater = (silent = false) => {
    if (!silent) {
      Alert.alert(
        t.resetTracker,
        t.resetConfirm,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.reset,
            style: 'destructive',
            onPress: () => performReset(),
          },
        ]
      );
    } else {
      performReset();
    }
  };

  const performReset = () => {
    const today = new Date().toDateString();
    const newHistory = history.filter(item => item.date !== today);
    
    setWaterCount(0);
    setHistory(newHistory);
    saveData(0, goal, newHistory, isPremium);
    
    if (!isPremium) {
      setAdCounter(0);
    }
  };

  const getProgressColor = () => {
    const progress = (waterCount / goal) * 100;
    if (progress < 30) return '#FF5252';
    if (progress < 60) return '#FFC107';
    if (progress < 90) return '#4CAF50';
    return '#2196F3';
  };

  const getMotivationEmoji = () => {
    if (waterCount === 0) return '🚀';
    if (waterCount < goal / 3) return '💪';
    if (waterCount < goal / 2) return '🔥';
    if (waterCount < goal) return '⭐';
    return '🏆';
  };

  const getMotivationText = () => {
    if (waterCount === 0) return t.timeToHydrate;
    if (waterCount >= goal) return t.missionAccomplished;
    return t.onTrack.replace('{goal}', goal);
  };

  const PremiumBadge = () => (
    <View style={styles.premiumBadge}>
      <Ionicons name="diamond" size={14} color="#FFD700" />
      <Text style={styles.premiumBadgeText}>{t.premium}</Text>
    </View>
  );

  const HealthBenefitCard = ({ title, description, color, index }) => (
    <View style={[styles.benefitCard, { backgroundColor: color }]}>
      <View style={styles.benefitIconContainer}>
        <FontAwesome5 
          name={['bolt', 'fire', 'gem', 'brain', 'leaf', 'shield-alt'][index]} 
          size={28} 
          color="white" 
        />
      </View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDescription}>{description}</Text>
    </View>
  );

  const WaterGlass = () => {
    const waterHeight = waterLevel.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    });

    return (
      <View style={styles.waterGlassContainer}>
        <View style={styles.glassOuter}>
          <View style={styles.glassRim} />
          <View style={styles.glassBody}>
            <Animated.View style={[
              styles.waterFill,
              { 
                height: waterHeight,
                backgroundColor: getProgressColor()
              }
            ]}>
              <View style={styles.waterWave} />
            </Animated.View>
            <View style={styles.glassPattern}>
              <View style={styles.patternLine} />
              <View style={styles.patternLine} />
              <View style={styles.patternLine} />
            </View>
          </View>
          <View style={styles.glassBase} />
        </View>
        <View style={styles.glassShadow} />
      </View>
    );
  };

  const NotificationSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>🔔 {t.notifications}</Text>
      
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={async () => {
          const granted = await checkAndRequestNotificationPermissions();
          if (granted) {
            Alert.alert(
              t.notificationSuccess,
              t.notificationSuccessMessage,
              [{ text: 'Harika!' }]
            );
          }
        }}>
        <Ionicons name="notifications" size={24} color="#1A237E" />
        <View style={styles.notificationButtonText}>
          <Text style={styles.notificationButtonTitle}>{t.manageNotifications}</Text>
          <Text style={styles.notificationButtonSubtitle}>{t.notificationSubtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.testNotificationButton}
        onPress={async () => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "💧 Test Hatırlatması",
              body: "Tebrikler! Bildirimler düzgün çalışıyor.",
              sound: 'default',
              data: { test: true },
            },
            trigger: { seconds: 1 },
          });
          Alert.alert(t.testNotificationSuccess, t.testNotificationMessage);
        }}>
        <Ionicons name="flash" size={20} color="#4CAF50" />
        <Text style={styles.testNotificationText}>{t.testNotification}</Text>
      </TouchableOpacity>
      
      <Text style={styles.notificationInfo}>
        {t.notificationInfo}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A237E" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="tint" size={32} color="#00BCD4" />
            <Text style={styles.appName}>{t.appName}</Text>
            {isPremium && <PremiumBadge />}
          </View>
          
          {!isPremium && (
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={showPremiumOffer}>
              <Ionicons name="rocket" size={16} color="white" />
              <Text style={styles.upgradeButtonText}>{t.upgrade}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.glassSection}>
          <WaterGlass />
          <View style={styles.glassInfo}>
            <Text style={styles.glassCount}>{waterCount}</Text>
            <Text style={styles.glassLabel}>/ {goal} {t.glasses}</Text>
            <Text style={styles.glassPercentage}>
              %{Math.round((waterCount / goal) * 100)} DOLU
            </Text>
          </View>
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>{getMotivationEmoji()}</Text>
          <Text style={styles.motivationText}>{getMotivationText()}</Text>
        </View>

        <View style={styles.quickActions}>
          {[1, 2, 3].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.quickActionButton}
              onPress={() => addWater(amount)}>
              <Text style={styles.quickActionText}>+{amount}</Text>
              <FontAwesome5 name="tint" size={20} color="#1A237E" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.mainActionButton}
          onPress={() => addWater()}>
          <FontAwesome5 name="plus-circle" size={28} color="white" />
          <Text style={styles.mainActionText}>{t.logWater}</Text>
        </TouchableOpacity>

        {!isPremium && (
          <TouchableOpacity 
            style={styles.premiumBanner}
            onPress={showPremiumOffer}>
            <View style={styles.premiumBannerContent}>
              <Ionicons name="diamond" size={24} color="#FFD700" />
              <View style={styles.premiumBannerText}>
                <Text style={styles.premiumBannerTitle}>{t.premiumBannerTitle}</Text>
                <Text style={styles.premiumBannerSubtitle}>{t.premiumBannerSubtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>{t.healthBenefits}</Text>
        <View style={styles.benefitsGrid}>
          {t.premiumFeatures.map((feature, index) => (
            <HealthBenefitCard
              key={index}
              title={feature}
              description={t.premiumDescriptions[index]}
              color={['#FF6B6B', '#FFA726', '#66BB6A', '#42A5F5', '#AB47BC', '#EC407A'][index]}
              index={index}
            />
          ))}
        </View>

        <View style={styles.goalSettings}>
          <Text style={styles.sectionTitle}>{t.dailyGoal}</Text>
          <View style={styles.goalButtons}>
            {[6, 8, 10, 12].map((target) => (
              <TouchableOpacity
                key={target}
                style={[
                  styles.goalButton,
                  goal === target && styles.goalButtonActive,
                  !isPremium && target > 10 && styles.goalButtonLocked,
                ]}
                onPress={() => changeGoal(target)}
                disabled={!isPremium && target > 10}>
                <Text style={[
                  styles.goalButtonText,
                  goal === target && styles.goalButtonTextActive,
                ]}>
                  {target}
                </Text>
                {!isPremium && target > 10 && (
                  <Ionicons name="lock-closed" size={12} color="#666" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          {!isPremium && (
            <Text style={styles.premiumNote}>🔒 {t.requiresPremium}</Text>
          )}
        </View>

        {/* BİLDİRİM AYARLARI */}
        <NotificationSettings />

        {history.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>{t.hydrationStats}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {history.reduce((sum, day) => sum + day.count, 0)}
                </Text>
                <Text style={styles.statLabel}>{t.totalGlasses}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {Math.round(history.reduce((sum, day) => sum + day.count, 0) / history.length)}
                </Text>
                <Text style={styles.statLabel}>{t.dailyAverage}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {history.filter(day => day.count >= goal).length}
                </Text>
                <Text style={styles.statLabel}>{t.goalsMet}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {isPremium ? '∞' : `${history.length}/7`}
                </Text>
                <Text style={styles.statLabel}>{t.daysTracked}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={resetWater}>
            <Ionicons name="refresh" size={20} color="#FF5252" />
            <Text style={styles.secondaryButtonText}>{t.resetDay}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={showGoalSettings}>
            <Ionicons name="settings" size={20} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>{t.settings}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.footer}</Text>
          <Text style={styles.copyright}>
            {t.copyright.replace('{edition}', isPremium ? t.premium : 'ÜCRETSİZ SÜRÜM')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#1A237E',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginLeft: 12,
    letterSpacing: 1.5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  premiumBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4081',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF4081',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 1,
  },
  tagline: {
    color: '#80DEEA',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  glassSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 25,
    paddingHorizontal: 20,
  },
  waterGlassContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  glassOuter: {
    alignItems: 'center',
  },
  glassRim: {
    width: 100,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    zIndex: 2,
  },
  glassBody: {
    width: 90,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderTopWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  waterWave: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
  },
  glassPattern: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 20,
    right: 20,
    justifyContent: 'space-around',
  },
  patternLine: {
    height: 1,
    backgroundColor: 'rgba(224, 224, 224, 0.5)',
  },
  glassBase: {
    width: 110,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderTopWidth: 0,
  },
  glassShadow: {
    width: 120,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 60,
    marginTop: 5,
  },
  glassInfo: {
    alignItems: 'flex-start',
  },
  glassCount: {
    fontSize: 64,
    fontWeight: '900',
    color: '#1A237E',
    textShadowColor: 'rgba(26, 35, 126, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  glassLabel: {
    fontSize: 24,
    color: '#666',
    fontWeight: '700',
    marginTop: -10,
  },
  glassPercentage: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '800',
    marginTop: 5,
  },
  motivationCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 20,
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  motivationText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A237E',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 20,
    marginHorizontal: 8,
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A237E',
    marginRight: 8,
  },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A237E',
    padding: 22,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  mainActionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
    letterSpacing: 1,
  },
  premiumBanner: {
    backgroundColor: '#1A237E',
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#3949AB',
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBannerText: {
    flex: 1,
    marginHorizontal: 15,
  },
  premiumBannerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  premiumBannerSubtitle: {
    color: '#C5CAE9',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A237E',
    marginHorizontal: 20,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  benefitCard: {
    width: (width - 50) / 2,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  benefitIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  benefitTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 1,
  },
  benefitDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  goalSettings: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 25,
    marginBottom: 25,
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  goalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  goalButtonActive: {
    backgroundColor: '#1A237E',
  },
  goalButtonLocked: {
    opacity: 0.6,
  },
  goalButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#666',
    marginRight: 5,
  },
  goalButtonTextActive: {
    color: 'white',
  },
  premiumNote: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
    letterSpacing: 0.5,
  },
  settingsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 25,
    borderRadius: 25,
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  notificationButtonText: {
    flex: 1,
    marginHorizontal: 15,
  },
  notificationButtonTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A237E',
    marginBottom: 4,
  },
  notificationButtonSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  testNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  testNotificationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 10,
  },
  notificationInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A237E',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 25,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A237E',
    marginLeft: 8,
    letterSpacing: 1,
  },
  footer: {
    backgroundColor: '#1A237E',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    color: '#80DEEA',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  copyright: {
    color: '#C5CAE9',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
});