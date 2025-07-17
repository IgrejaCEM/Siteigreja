import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormHelperText,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useFormik } from 'formik';
import * as yup from 'yup';
import InputMask from 'react-input-mask';
import axios from 'axios';
import LoteCard from './LoteCard';

const validationSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  telefone: yup.string().required('Telefone é obrigatório'),
  cpf: yup.string().when('requireCpf', {
    is: true,
    then: yup.string().required('CPF é obrigatório')
  }),
  idade: yup.string().when('requireAge', {
    is: true,
    then: yup.string().required('Idade é obrigatória')
  }),
  genero: yup.string().when('requireGender', {
    is: true,
    then: yup.string().required('Gênero é obrigatório')
  }),
  endereco: yup.string().when('requireAddress', {
    is: true,
    then: yup.string().required('Endereço é obrigatório')
  }),
  autorizacaoImagem: yup.boolean().when('requireImageAuth', {
    is: true,
    then: yup.boolean().oneOf([true], 'Você precisa autorizar o uso da sua imagem')
  }),
  aceitaTermos: yup.boolean().oneOf([true], 'Você precisa aceitar os termos'),
  camposExtras: yup.object()
});

const RegistrationForm = ({ 
  eventId,
  lots = [], 
  requiredFields = {
    cpf: false,
    idade: false,
    genero: false,
    endereco: false,
    autorizacaoImagem: false
  },
  customFields = [],
  onSubmit 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [error, setError] = useState('');
  const [selectedLot, setSelectedLot] = useState(null);

  const steps = ['Selecionar Lote', 'Dados Pessoais', 'Endereço', 'Termos e Condições', 'Confirmação'];

  const formik = useFormik({
    initialValues: {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      genero: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      autorizacaoImagem: false,
      aceitaTermos: false,
      camposExtras: {},
      requireCpf: requiredFields.cpf,
      requireIdade: requiredFields.idade,
      requireGenero: requiredFields.genero,
      requireEndereco: requiredFields.endereco,
      requireAutorizacaoImagem: requiredFields.autorizacaoImagem
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await onSubmit(values);
        setActiveStep(steps.length);
      } catch (error) {
        setError('Erro ao enviar formulário. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    // Carregar estados do Brasil
    const fetchEstados = async () => {
      try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        setEstados(response.data.sort((a, b) => a.nome.localeCompare(b.nome)));
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    // Carregar cidades quando um estado for selecionado
    const fetchCidades = async () => {
      if (formik.values.estado) {
        try {
          const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formik.values.estado}/municipios`);
          setCidades(response.data.sort((a, b) => a.nome.localeCompare(b.nome)));
        } catch (error) {
          console.error('Erro ao carregar cidades:', error);
        }
      } else {
        setCidades([]);
      }
    };
    fetchCidades();
  }, [formik.values.estado]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const consultarCEP = async (cep) => {
    if (cep.replace(/\D/g, '').length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.data.erro) {
          formik.setValues({
            ...formik.values,
            rua: response.data.logradouro,
            bairro: response.data.bairro,
            cidade: response.data.localidade,
            estado: response.data.uf
          });
        }
      } catch (error) {
        console.error('Erro ao consultar CEP:', error);
      }
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecione um lote de ingressos
            </Typography>
            <Grid container spacing={2}>
              {lots.map((lot) => (
                <LoteCard
                  key={lot.id}
                  lote={lot}
                  onSelect={(lot) => {
                    setSelectedLot(lot);
                    handleNext();
                  }}
                  disabled={loading}
                />
              ))}
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Lote selecionado: {selectedLot?.name} - {formatPrice(selectedLot?.price)}
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formik.values.nome}
                onChange={formik.handleChange}
                error={formik.touched.nome && Boolean(formik.errors.nome)}
                helperText={formik.touched.nome && formik.errors.nome}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <InputMask
                mask="(99) 99999-9999"
                value={formik.values.telefone}
                onChange={formik.handleChange}
              >
                {(inputProps) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    label="Telefone / WhatsApp"
                    name="telefone"
                    error={formik.touched.telefone && Boolean(formik.errors.telefone)}
                    helperText={formik.touched.telefone && formik.errors.telefone}
                    required
                  />
                )}
              </InputMask>
            </Grid>
            {requiredFields.cpf && (
              <Grid item xs={12}>
                <InputMask
                  mask="999.999.999-99"
                  value={formik.values.cpf}
                  onChange={formik.handleChange}
                >
                  {(inputProps) => (
                    <TextField
                      {...inputProps}
                      fullWidth
                      label="CPF"
                      name="cpf"
                      error={formik.touched.cpf && Boolean(formik.errors.cpf)}
                      helperText={formik.touched.cpf && formik.errors.cpf}
                    />
                  )}
                </InputMask>
              </Grid>
            )}
            {requiredFields.idade && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  name="dataNascimento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.dataNascimento}
                  onChange={formik.handleChange}
                  error={formik.touched.dataNascimento && Boolean(formik.errors.dataNascimento)}
                  helperText={formik.touched.dataNascimento && formik.errors.dataNascimento}
                />
              </Grid>
            )}
            {requiredFields.genero && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Gênero</InputLabel>
                  <Select
                    name="genero"
                    value={formik.values.genero}
                    onChange={formik.handleChange}
                    error={formik.touched.genero && Boolean(formik.errors.genero)}
                  >
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="feminino">Feminino</MenuItem>
                    <MenuItem value="outro">Outro</MenuItem>
                    <MenuItem value="naoInformar">Prefiro não informar</MenuItem>
                  </Select>
                  {formik.touched.genero && formik.errors.genero && (
                    <FormHelperText error>{formik.errors.genero}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return requiredFields.endereco ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <InputMask
                mask="99999-999"
                value={formik.values.cep}
                onChange={(e) => {
                  formik.handleChange(e);
                  consultarCEP(e.target.value);
                }}
              >
                {(inputProps) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    label="CEP"
                    name="cep"
                    error={formik.touched.cep && Boolean(formik.errors.cep)}
                    helperText={formik.touched.cep && formik.errors.cep}
                  />
                )}
              </InputMask>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Rua"
                name="rua"
                value={formik.values.rua}
                onChange={formik.handleChange}
                error={formik.touched.rua && Boolean(formik.errors.rua)}
                helperText={formik.touched.rua && formik.errors.rua}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Número"
                name="numero"
                value={formik.values.numero}
                onChange={formik.handleChange}
                error={formik.touched.numero && Boolean(formik.errors.numero)}
                helperText={formik.touched.numero && formik.errors.numero}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Complemento"
                name="complemento"
                value={formik.values.complemento}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bairro"
                name="bairro"
                value={formik.values.bairro}
                onChange={formik.handleChange}
                error={formik.touched.bairro && Boolean(formik.errors.bairro)}
                helperText={formik.touched.bairro && formik.errors.bairro}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={formik.values.estado}
                  onChange={formik.handleChange}
                  error={formik.touched.estado && Boolean(formik.errors.estado)}
                >
                  {estados.map((estado) => (
                    <MenuItem key={estado.sigla} value={estado.sigla}>
                      {estado.nome}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.estado && formik.errors.estado && (
                  <FormHelperText error>{formik.errors.estado}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cidade</InputLabel>
                <Select
                  name="cidade"
                  value={formik.values.cidade}
                  onChange={formik.handleChange}
                  error={formik.touched.cidade && Boolean(formik.errors.cidade)}
                  disabled={!formik.values.estado}
                >
                  {cidades.map((cidade) => (
                    <MenuItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.cidade && formik.errors.cidade && (
                  <FormHelperText error>{formik.errors.cidade}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        ) : (
          <Typography>Endereço não é necessário para este evento.</Typography>
        );

      case 3:
        return (
          <Grid container spacing={2}>
            {requiredFields.autorizacaoImagem && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="autorizacaoImagem"
                      checked={formik.values.autorizacaoImagem}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Autorizo o uso da minha imagem em fotos e vídeos do evento para divulgação"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="aceitaTermos"
                    checked={formik.values.aceitaTermos}
                    onChange={formik.handleChange}
                    required
                  />
                }
                label="Li e aceito os termos e condições e a política de privacidade"
              />
              {formik.touched.aceitaTermos && formik.errors.aceitaTermos && (
                <FormHelperText error>{formik.errors.aceitaTermos}</FormHelperText>
              )}
            </Grid>
            {/* Campos extras personalizados */}
            {customFields.map((field, index) => (
              <Grid item xs={12} key={index}>
                {field.type === 'text' ? (
                  <TextField
                    fullWidth
                    label={field.label}
                    name={`camposExtras.${field.name}`}
                    value={formik.values.camposExtras[field.name] || ''}
                    onChange={formik.handleChange}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <FormControl fullWidth>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      name={`camposExtras.${field.name}`}
                      value={formik.values.camposExtras[field.name] || ''}
                      onChange={formik.handleChange}
                      required={field.required}
                    >
                      {field.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}
              </Grid>
            ))}
          </Grid>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumo da Inscrição
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography><strong>Nome:</strong> {formik.values.nome}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>E-mail:</strong> {formik.values.email}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Telefone:</strong> {formik.values.telefone}</Typography>
                </Grid>
                {requiredFields.cpf && (
                  <Grid item xs={12}>
                    <Typography><strong>CPF:</strong> {formik.values.cpf}</Typography>
                  </Grid>
                )}
                {requiredFields.idade && (
                  <Grid item xs={12}>
                    <Typography><strong>Data de Nascimento:</strong> {formik.values.dataNascimento}</Typography>
                  </Grid>
                )}
                {requiredFields.genero && (
                  <Grid item xs={12}>
                    <Typography><strong>Gênero:</strong> {formik.values.genero}</Typography>
                  </Grid>
                )}
                {requiredFields.endereco && (
                  <>
                    <Grid item xs={12}>
                      <Divider />
                      <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Endereço</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        {formik.values.rua}, {formik.values.numero}
                        {formik.values.complemento && ` - ${formik.values.complemento}`}
                      </Typography>
                      <Typography>
                        {formik.values.bairro} - {formik.values.cidade}/{formik.values.estado}
                      </Typography>
                      <Typography>CEP: {formik.values.cep}</Typography>
                    </Grid>
                  </>
                )}
                {customFields.length > 0 && (
                  <>
                    <Grid item xs={12}>
                      <Divider />
                      <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Informações Adicionais</Typography>
                    </Grid>
                    {customFields.map((field) => (
                      <Grid item xs={12} key={field.name}>
                        <Typography>
                          <strong>{field.label}:</strong> {formik.values.camposExtras[field.name]}
                        </Typography>
                      </Grid>
                    ))}
                  </>
                )}
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Voltar
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Próximo
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formik.isValid}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirmar Inscrição'}
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default RegistrationForm; 