package gordo.peluche.IService;

import java.util.List;
import gordo.peluche.Entidades.Cliente;

public interface ClienteIService {
    public List<Cliente> findAllClientes();
    public Cliente saveCliente(Cliente cliente);
}
