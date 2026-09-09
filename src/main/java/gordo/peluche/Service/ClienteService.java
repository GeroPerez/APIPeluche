package gordo.peluche.Service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import gordo.peluche.IService.ClienteIService;
import gordo.peluche.Entidades.Cliente;
import gordo.peluche.Repository.ClienteRepository;

@Service
public class ClienteService implements ClienteIService {
    @Autowired
    private ClienteRepository cRepository;
    public List<Cliente> findAllClientes() {
        return cRepository.findAll();
    }
    public Cliente saveCliente(Cliente cliente) {
        return cRepository.save(cliente);
    }
}
