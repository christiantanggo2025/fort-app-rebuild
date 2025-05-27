import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const buttonSpacing = 20;
const buttonWidth = (width - 40 - 2 * buttonSpacing) / 3;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    color: '#000',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  activeButton: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    borderRadius: 8,
    width: buttonWidth,
    alignItems: 'center',
  },
  greyButton: {
    backgroundColor: '#aaa',
    paddingVertical: 16,
    borderRadius: 8,
    width: buttonWidth,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fullText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activeFullWidth: {
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
  },
  inactiveFullWidth: {
    backgroundColor: '#ccc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  dropdownText: {
    flex: 1,
    color: '#333',
  },
  dropdownArrow: {
    marginLeft: 8,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingRight: 10,
  },
  textLink: {
    color: '#008080',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  banner: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 8,
    marginVertical: 20,
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '85%',
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});

export default styles;
