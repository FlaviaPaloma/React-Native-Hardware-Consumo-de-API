import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);

  // Função para obter a localização real do usuário
  const getLocation = async () => {
    // Solicitar permissão para acessar a localização
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão para acessar a localização foi negada');
      return;
    }

    // Obter a localização
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    // Realizar a geocodificação reversa para obter o endereço
    const reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
    if (reverseGeocode && reverseGeocode.length > 0) {
      const { street, city, region, country } = reverseGeocode[0];
      
      // Construir o endereço, garantindo que não apareçam vírgulas extras
      let fullAddress = '';
      if (street) fullAddress += street;
      if (city) fullAddress += `, ${city}`;
      if (region) fullAddress += `, ${region}`;
      if (country) fullAddress += `, ${country}`;

      setAddress(fullAddress || 'Endereço não encontrado');  // Caso não consiga obter nenhum dado de localização
    } else {
      setAddress('Endereço não encontrado');
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !address) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }

    const userData = { name, email, address };

    try {
      const response = await axios.post('http://192.168.1.182:3000/usuarios', userData);
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      console.log('Resposta da API:', response.data);
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
      if (error.response) {
        // Erro retornado pelo servidor (status code 4xx ou 5xx)
        Alert.alert('Erro do Servidor', error.response.data.error || 'Erro desconhecido no servidor');
      } else if (error.request) {
        // Sem resposta do servidor (problemas de rede)
        Alert.alert('Erro de Rede', 'Não foi possível se conectar ao servidor.');
      } else {
        // Erro ao configurar a requisição
        Alert.alert('Erro', error.message);
      }
    }
  };

  // Chama a função de localização quando o app é carregado
  React.useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formulário de Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#ffffff"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#ffffff"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Endereço"
        placeholderTextColor="#ffffff"
        value={address}
        onChangeText={setAddress}
        editable={false}  // Desabilita o campo para o usuário
      />

      <Button title="Enviar" color="#28a745" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eaf9e4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c6e49',
  },
  input: {
    height: 50,
    borderColor: '#98FB98',
    borderWidth: 2,
    marginBottom: 15,
    width: '100%',
    paddingLeft: 10,
    borderRadius: 8,
    backgroundColor: '#4caf50',
    color: '#ffffff',
    fontSize: 16,
  },
});
