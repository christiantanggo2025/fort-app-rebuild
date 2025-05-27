import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Buffer } from 'buffer';
import { Linking } from 'react-native';

global.Buffer = Buffer;

const screenWidth = Dimensions.get('window').width;

export default function CustomerAppDashboard() {
  const navigation = useNavigation();
  const [carouselPosts, setCarouselPosts] = useState([]);
  const [highlightPosts, setHighlightPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [userId, setUserId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [websiteLink, setWebsiteLink] = useState('');
  const [waiverLink, setWaiverLink] = useState('');

  const carouselRef = useRef(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setUserId(session?.user?.id || null);

    fetchCarousel();
    fetchHighlights();
    fetchWebsiteLink();

    const interval = setInterval(() => {
      fetchCarousel();
      fetchHighlights();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchWebsiteLink = async () => {
    const { data } = await supabase
      .from('app_links')
      .select('website_link, waiver_link')
      .eq('id', 1)
      .single();

    if (data?.website_link) {
      setWebsiteLink(data.website_link);
    }
    if (data?.waiver_link) {
      setWaiverLink(data.waiver_link);
    }
  };

  const fetchCarousel = async () => {
    const { data, error } = await supabase
      .from('home_carousel')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data.length > 0) {
      setCarouselPosts(data);
    } else {
      setCarouselPosts([{ id: 'fallback', image_url: require('../assets/FortLogo.png') }]);
    }
  };

  const fetchHighlights = async () => {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: likesData } = await supabase
      .from('post_likes')
      .select('*');

    const likesMap = {};
    likesData?.forEach((like) => {
      if (!likesMap[like.post_id]) likesMap[like.post_id] = new Set();
      likesMap[like.post_id].add(like.auth_user_id);
    });

    setHighlightPosts(postsData || []);
    setLikes(likesMap);
  };

  const handleLikeToggle = async (postId) => {
    if (!userId) return;

    const hasLiked = likes[postId]?.has(userId);

    if (hasLiked) {
      await supabase.from('post_likes').delete().match({ post_id: postId, auth_user_id: userId });
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, auth_user_id: userId }]);
    }

    fetchHighlights();
  };

  const renderItem = ({ item }) => (
    <Image
      source={
        typeof item.image_url === 'string'
          ? { uri: item.image_url.replace(/([^:]\/)\/+/g, '$1') }
          : item.image_url
      }
      style={styles.carouselImage}
    />
  );

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      carouselRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Welcome To The Fort</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerAccountScreen')}
            style={styles.accountButton}
          >
            <Ionicons name="person-circle-outline" size={32} color="black" />
          </TouchableOpacity>
        </View>

        {/* Carousel */}
        <View style={styles.carouselWrapper}>
          <TouchableOpacity onPress={() => scrollToIndex(Math.max(currentIndex - 1, 0))}>
            <Ionicons name="chevron-back-circle" size={30} color="black" />
          </TouchableOpacity>
          <FlatList
            ref={carouselRef}
            horizontal
            pagingEnabled
            data={carouselPosts}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setCurrentIndex(index);
            }}
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity
            onPress={() =>
              scrollToIndex(Math.min(currentIndex + 1, carouselPosts.length - 1))
            }
          >
            <Ionicons name="chevron-forward-circle" size={30} color="black" />
          </TouchableOpacity>
        </View>

        {/* Dots */}
        <View style={styles.indicatorRow}>
          {carouselPosts.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* 4 Main Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.mainIconButton}
            onPress={() => navigation.navigate('UploadHighlightScreen')}
          >
            <Ionicons name="cloud-upload-outline" size={24} color="white" />
            <Text style={styles.iconText}>Upload Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainIconButton}
            onPress={() => {
              if (websiteLink) Linking.openURL(websiteLink);
              else Alert.alert('No Link Available');
            }}
          >
            <Ionicons name="calendar-outline" size={24} color="white" />
            <Text style={styles.iconText}>Book Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainIconButton}
            onPress={() => {
              if (waiverLink) {
                Linking.openURL(waiverLink);
              } else {
                Alert.alert('Waiver link not available');
              }
            }}
          >
            <Ionicons name="document-text-outline" size={24} color="white" />
            <Text style={styles.iconText}>Waiver</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.mainIconButton}
            onPress={() => navigation.navigate('EventsCalendarScreen')}
          >
            <Ionicons name="calendar-number-outline" size={24} color="white" />
            <Text style={styles.iconText}>Events</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Feed */}
        {highlightPosts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <Image source={{ uri: post.image_url }} style={styles.postImage} />
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postDesc}>{post.description}</Text>
            <TouchableOpacity
              onPress={() => handleLikeToggle(post.id)}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}
            >
              <Ionicons
                name={
                  likes[post.id]?.has(userId)
                    ? 'heart'
                    : 'heart-outline'
                }
                size={20}
                color="red"
              />
              <Text style={{ marginLeft: 5 }}>Like</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navIconButton}
          onPress={() => navigation.navigate('CustomerAppDashboard')}
        >
          <Ionicons name="home-outline" size={26} color="#008080" />
          <Text style={styles.iconLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navIconButton}
          onPress={() => alert('Entertainment section coming soon.')}
        >
          <Ionicons name="musical-notes-outline" size={26} color="#008080" />
          <Text style={styles.iconLabel}>Entertainment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navIconButton}
          onPress={() => navigation.navigate('Volleyball')}
        >
          <Ionicons name="football-outline" size={26} color="#008080" />
          <Text style={styles.iconLabel}>Volleyball</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    color: 'black',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  accountButton: { position: 'absolute', right: 10 },
  carouselWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  carouselImage: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: '#008080' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  mainIconButton: {
    alignItems: 'center',
    backgroundColor: '#008080',
    padding: 10,
    borderRadius: 10,
    width: 80,
  },
  navIconButton: {
    alignItems: 'center',
  },
  iconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 10,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  postDesc: {
    fontSize: 14,
    marginTop: 3,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  iconLabel: {
    fontSize: 12,
    color: '#008080',
  },
});
