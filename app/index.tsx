import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';


function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela Inicial</Text>

      <View style={styles.buttonContainer}>
        <Link href="/qr_code" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Ler QR Code</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/frame" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Abrir Frame</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/foto" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Tirar Foto</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    backgroundColor: '#f0f8ff', // Cor de fundo tom claro (azul bem suave)
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30, // Espaço abaixo do título
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff', // Cor azul para os botões
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10, // Espaço entre os botões
    width: '80%', // Ajusta largura para melhor visualização
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', // Texto branco
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;